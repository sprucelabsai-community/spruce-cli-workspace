import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import {
	CORE_NAMESPACE,
	CORE_SCHEMA_VERSION,
} from '@sprucelabs/spruce-skill-utils'
import { templates, ValueTypes } from '@sprucelabs/spruce-templates'
import { assert, test } from '@sprucelabs/test'
import SchemaGenerator from '../../generators/SchemaGenerator'
import FieldTemplateItemBuilder from '../../templateItemBuilders/FieldTemplateItemBuilder'
import SchemaTemplateItemBuilder from '../../templateItemBuilders/SchemaTemplateItemBuilder'
import AbstractSchemaTest from '../../test/AbstractSchemaTest'

const LOCAL_NAMESPACE = 'TacoBell'

export default class SchemaValueTypeGenerationTest extends AbstractSchemaTest {
	private static generator: SchemaGenerator
	protected static async beforeEach() {
		await super.beforeEach()
		this.generator = new SchemaGenerator({ templates, term: this.ui })

		const cli = await this.installSchemaFeature('schemas')

		const schemasDir = this.resolvePath('src', 'schemas')
		await diskUtil.copyDir(this.resolveTestPath('test_builders'), schemasDir)
		await diskUtil.copyDir(
			this.resolveTestPath('dynamic_key_schemas'),
			schemasDir
		)

		await cli.getFeature('schema').Action('sync').execute({})
	}

	@test()
	protected static async hasGenerateMethod() {
		assert.isFunction(this.generator.generateValueTypes)
	}

	@test()
	protected static async runsWithoutBreakingWithNoArgs() {
		const results = await this.generator.generateValueTypes(
			this.resolveHashSprucePath('tmp'),
			{
				schemaTemplateItems: [],
				fieldTemplateItems: [],
			}
		)

		assert.isTruthy(results)
	}

	private static async generateValueTypes() {
		const {
			fieldTemplateItems,
			schemaTemplateItems,
		} = await this.fetchAllTemplateItems()

		await this.generator.generateFieldTypes(
			this.resolveHashSprucePath('schemas'),
			{
				fieldTemplateItems,
			}
		)

		return this.generator.generateValueTypes(
			this.resolveHashSprucePath('tmp'),
			{
				schemaTemplateItems,
				fieldTemplateItems,
			}
		)
	}

	private static async fetchAllTemplateItems() {
		const schemaStore = this.StoreFactory().Store('schema')

		const [
			{ schemasByNamespace, errors: schemaErrors },
			{ fields, errors: fieldErrors },
		] = await Promise.all([
			schemaStore.fetchSchemas({ localNamespace: LOCAL_NAMESPACE }),
			schemaStore.fetchFields(),
		])

		assert.isLength(schemaErrors, 0)
		assert.isLength(fieldErrors, 0)

		const schemaBuilder = new SchemaTemplateItemBuilder('LocalNamespace')
		const schemaTemplateItems = schemaBuilder.generateTemplateItems(
			schemasByNamespace,
			'#spruce/schemas'
		)

		const fieldBuilder = new FieldTemplateItemBuilder()
		const fieldTemplateItems = fieldBuilder.generateTemplateItems(fields)

		return {
			schemaTemplateItems,
			fieldTemplateItems,
		}
	}

	@test()
	protected static async generatesValidTypesFile() {
		const results = await this.generateValueTypes()
		assert.isAbove(results.length, 0)

		const first = results[0].path
		assert.isTrue(diskUtil.doesFileExist(first))

		await this.Service('typeChecker').check(first)
	}

	@test(
		'generates person.firstName value type (string)',
		`${CORE_NAMESPACE}.person.${CORE_SCHEMA_VERSION.constValue}.firstName.valueTypes`,
		{
			type: 'string',
			value: 'string',
			schemaType: 'string',
		}
	)
	@test(
		'generates skill.creators value type (schema)',
		`${CORE_NAMESPACE}.skill.${CORE_SCHEMA_VERSION.constValue}.creators.valueTypes`,
		{
			type: `SpruceSchemas.Spruce.v2020_07_22.SkillCreator[]`,
			value: 'skillCreatorSchema',
			schemaType: `SpruceSchemas.Spruce.v2020_07_22.SkillCreatorSchema`,
		}
	)
	@test(
		'generates dynamic field with nested schemas',
		`${LOCAL_NAMESPACE}.mercuryContract.${CORE_SCHEMA_VERSION.constValue}.__dynamicFieldSignature.valueTypes`,
		{
			type: `{ schemaId: 'eventSignature', version: 'v2020_07_22', values: SpruceSchemas.${LOCAL_NAMESPACE}.v2020_07_22.EventSignature } | { schemaId: 'eventSignature2', version: 'v2020_07_22', values: SpruceSchemas.${LOCAL_NAMESPACE}.v2020_07_22.EventSignature2 }`,
			value: '[eventSignatureSchema, eventSignature2Schema]',
			schemaType: `(SpruceSchemas.${LOCAL_NAMESPACE}.v2020_07_22.EventSignatureSchema | SpruceSchemas.${LOCAL_NAMESPACE}.v2020_07_22.EventSignature2Schema)[]`,
		}
	)
	protected static async importsTypes(
		path: string,
		expected: Record<string, any>
	) {
		const results = await this.generateValueTypes()

		const valueTypes = await this.Service('import').importDefault<ValueTypes>(
			results[0].path
		)

		assert.isObject(valueTypes)
		assert.isAbove(
			Object.keys(valueTypes).length,
			0,
			'Value types came back as empty object'
		)
		assert.doesInclude(valueTypes, {
			[path]: expected,
		})
	}
}
