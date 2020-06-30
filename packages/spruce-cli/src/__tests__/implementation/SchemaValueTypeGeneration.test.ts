import { Mercury } from '@sprucelabs/mercury'
import { templates } from '@sprucelabs/spruce-templates'
import { assert, test } from '@sprucelabs/test'
import AbstractSchemaTest from '../../AbstractSchemaTest'
import { HASH_SPRUCE_DIR } from '../../constants'
import ServiceFactory, { Service } from '../../factories/ServiceFactory'
import SchemaGenerator from '../../generators/SchemaGenerator'
import SchemaStore from '../../stores/SchemaStore'
import { IValueTypes } from '../../types/cli.types'
import diskUtil from '../../utilities/disk.utility'

export default class SchemaValueTypeGenerationTest extends AbstractSchemaTest {
	private static generator: SchemaGenerator
	protected static async beforeEach() {
		super.beforeEach()
		// this.cwd =
		// '/var/folders/qw/v2bfr0c94bn37vclwvcltsj40000gn/tmp/7de06e3c-6bf2-4ffc-8be9-138ed9a5bf01'
		this.generator = new SchemaGenerator(templates)
		await this.bootCliInstallSchemasAndSetCwd('value-type-generation')
	}

	@test()
	protected static async hasGenerateMethod() {
		assert.isFunction(this.generator.generateValueTypes)
	}

	@test()
	protected static async runsWithoutBreakingWithNoArgs() {
		const results = await this.generator.generateValueTypes(
			this.resolvePath(HASH_SPRUCE_DIR),
			{
				schemaTemplateItems: [],
				fieldTemplateItems: []
			}
		)

		assert.isOk(results)
	}

	private static async generateValueTypes() {
		const {
			fieldTemplateItems,
			schemaTemplateItems
		} = await SchemaValueTypeGenerationTest.fetchAllTemplateItems()

		await this.generator.generateFieldTypes(
			this.resolvePath(HASH_SPRUCE_DIR, 'schemas'),
			{
				fieldTemplateItems
			}
		)

		return this.generator.generateValueTypes(
			this.resolvePath(HASH_SPRUCE_DIR),
			{
				schemaTemplateItems,
				fieldTemplateItems
			}
		)
	}

	private static async fetchAllTemplateItems() {
		const schemaStore = new SchemaStore(
			this.cwd,
			new ServiceFactory(new Mercury())
		)

		const schemasDir = this.resolvePath('src/schemas')
		const addonsDir = this.resolvePath('src/addons')

		const schemaRequest = schemaStore.fetchSchemaTemplateItems(schemasDir)
		const fieldRequest = schemaStore.fetchFieldTemplateItems(addonsDir)

		const [schemaResults, fieldResults] = await Promise.all([
			schemaRequest,
			fieldRequest
		])

		return {
			schemaTemplateItems: schemaResults.items,
			fieldTemplateItems: fieldResults.items
		}
	}

	@test()
	protected static async itGeneratesAValidTypesFiles() {
		const results = await this.generateValueTypes()
		assert.isAbove(results.generatedFiles.length, 0)

		const first = results.generatedFiles[0].path
		assert.isTrue(diskUtil.doesFileExist(first))

		await this.Service(Service.TypeChecker).check(first)
	}

	@test.only()
	protected static async importsTypes() {
		const results = await this.generateValueTypes()
		// this.Service(Service.Command).execute(
		// 	`code ${results.generatedFiles[0].path}`
		// )

		const valueTypes = await this.Service(Service.Import).importDefault<
			IValueTypes
		>(results.generatedFiles[0].path)

		assert.isObject(valueTypes)
		assert.deepEqual(valueTypes.Core.user.firstName, {
			Type: 'string',
			Value: 'string',
			DefinitionType: 'string'
		})
	}
}
