import pathUtil from 'path'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import {
	CORE_SCHEMA_VERSION,
	CORE_NAMESPACE,
	DEFAULT_GLOBAL_SCHEMA_NAMESPACE,
} from '@sprucelabs/spruce-skill-utils'
import { assert, test } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import { coreSchemas } from '../../../features/schema/stores/SchemaStore'
import AbstractSchemaTest from '../../../tests/AbstractSchemaTest'
import testUtil from '../../../tests/utilities/test.utility'

//TODO rethink how to check for count of files and results or where it may make sense to move this test
const TYPE_FILE_COUNT = 2 // (only fieldMap and field.types... schema.types checked by +1 in tests)
const SYNC_FILE_COUNT = Object.keys(coreSchemas).length + TYPE_FILE_COUNT
const MOCK_CORE_SYNC_FILE_COUNT = 4 + TYPE_FILE_COUNT

export default class KeepsSchemasInSyncTest extends AbstractSchemaTest {
	private static readonly coreSyncOptions = {
		shouldGenerateCoreSchemaTypes: true,
	}

	@test()
	protected static async hasSyncSchemaAction() {
		await this.Cli()
		assert.isFunction(this.Action('schema', 'sync').execute)
	}

	@test()
	protected static async failsBecauseSchemasIsNotInstalled() {
		await this.Cli()

		const err = await assert.doesThrowAsync(() =>
			this.Action('schema', 'sync').execute({})
		)

		errorAssert.assertError(err, 'FEATURE_NOT_INSTALLED')
	}

	@test()
	protected static async syncingWithNoSchemasSucceeds() {
		await this.installSchemaFeature('schemas')

		const results = await this.Action('schema', 'sync').execute({})

		assert.isFalsy(results.errors)

		//TODO determine better way to count files
		testUtil.assertCountsByAction(results.files, {
			updated: 0,
			generated: SYNC_FILE_COUNT,
			skipped: 0,
		})
	}

	@test()
	protected static async syncingWithNoSchemasAndFetchCoreSchemasFalseSucceeds() {
		await this.installSchemaFeature('schemas')

		const results = await this.Action('schema', 'sync').execute({
			shouldFetchCoreSchemas: false,
		})

		assert.isFalsy(results.errors)

		testUtil.assertCountsByAction(results.files, {
			updated: 0,
			generated: TYPE_FILE_COUNT,
			skipped: 0,
		})
	}

	@test()
	protected static async syncingCleansUpTempFiles() {
		await this.installSchemaFeature('schemas')

		const results = await this.Action('schema', 'sync').execute({})

		assert.isFalsy(results.errors)

		const tmpFile = this.resolveHashSprucePath(
			'schemas',
			'tmp',
			'valueType.tmp.ts'
		)

		assert.isFalse(diskUtil.doesFileExist(tmpFile))
	}

	@test()
	protected static async syncingCoreSchemasGeneratesTypesFile() {
		await this.installSchemaFeature('schemas')
		await this.copyMockCoreSchemas()

		const results = await this.Action('schema', 'sync').execute(
			this.coreSyncOptions
		)

		assert.isUndefined(results.errors)
		assert.isTruthy(results.files)

		assert.isLength(results.files, MOCK_CORE_SYNC_FILE_COUNT)

		testUtil.assertCountsByAction(results.files, {
			generated: MOCK_CORE_SYNC_FILE_COUNT,
			skipped: 0,
			updated: 0,
		})

		assert.isTrue(diskUtil.doesFileExist(this.coreSchemaTypesFile))

		await this.assertTypesFileGeneratesArraySelect(this.coreSchemaTypesFile)
	}

	@test()
	protected static async syncSchemasTwiceSkipsFiles() {
		await this.syncSchemas('schemas', this.coreSyncOptions)
		const results = await this.Action('schema', 'sync').execute(
			this.coreSyncOptions
		)

		assert.isFalsy(results.errors)
		assert.isAbove(results.files?.length, 0)

		testUtil.assertCountsByAction(results.files, {
			generated: 0,
			skipped: results.files?.length ?? 0,
			updated: 0,
		})
	}

	@test()
	protected static async makeSureSchemaTypesAreVersioned() {
		await this.installSchemaFeature('schemas')

		await this.copyMockCoreSchemas()

		const results = await this.Action('schema', 'sync').execute(
			this.coreSyncOptions
		)

		assert.isFalsy(results.errors)

		const typesContents = diskUtil.readFile(this.coreSchemaTypesFile)
		assert.doesInclude(
			typesContents,
			new RegExp(
				`SpruceSchemas.${CORE_NAMESPACE}.${CORE_SCHEMA_VERSION.constValue}(.*?)interface Person`,
				'gis'
			)
		)
	}

	@test()
	protected static async shouldGenerateCoreSchemaTypesGeneratesValidFiles() {
		await this.installSchemaFeature('schemas')

		await this.copyMockCoreSchemas()

		const results = await this.Action('schema', 'sync').execute(
			this.coreSyncOptions
		)

		assert.isFalsy(results.errors)
		assert.isTruthy(results.files)

		await this.assertValidActionResponseFiles(results)

		const typesContents = diskUtil.readFile(this.coreSchemaTypesFile)

		assert.doesNotInclude(typesContents, /@sprucelabs\/spruce-core-schemas/gi)
		assert.doesInclude(
			typesContents,
			new RegExp(
				`export declare namespace ${DEFAULT_GLOBAL_SCHEMA_NAMESPACE}.${CORE_NAMESPACE}.${CORE_SCHEMA_VERSION.constValue}`,
				'gis'
			)
		)

		const orgSchema = testUtil.assertFileByNameInGeneratedFiles(
			'organization.schema.ts',
			results.files
		)

		const locationSchemaContents = diskUtil.readFile(orgSchema)
		assert.doesInclude(locationSchemaContents, 'SchemaRegistry')
	}

	@test()
	protected static async generateCoreSchemaInCoreSchemasModule() {
		await this.installSchemaFeature('schemas')

		const pkg = this.Service('pkg')
		pkg.set({ path: 'name', value: '@sprucelabs/spruce-core-schemas' })

		await this.copyMockCoreSchemas()

		const results = await this.Action('schema', 'sync').execute({})

		assert.isFalsy(results.errors)
		assert.isTruthy(results.files)

		const typesContents = diskUtil.readFile(this.coreSchemaTypesFile)

		assert.doesNotInclude(typesContents, /@sprucelabs\/spruce-core-schemas/gi)
		assert.doesInclude(
			typesContents,
			new RegExp(
				`export declare namespace ${DEFAULT_GLOBAL_SCHEMA_NAMESPACE}.${CORE_NAMESPACE}.${CORE_SCHEMA_VERSION.constValue}`,
				'gis'
			)
		)

		const orgSchema = testUtil.assertFileByNameInGeneratedFiles(
			'organization.schema.ts',
			results.files
		)

		const locationSchemaContents = diskUtil.readFile(orgSchema)
		assert.doesInclude(locationSchemaContents, 'SchemaRegistry')
	}

	@test()
	protected static async canHandleHyphenSchemaIds() {
		await this.syncSchemas('schemas')

		const createResponse = await this.Action('schema', 'create').execute({
			nameReadable: 'Test schema',
			nameCamel: 'testSchema',
		})

		assert.isFalsy(createResponse.errors)

		const builderPath = testUtil.assertFileByNameInGeneratedFiles(
			'testSchema.builder.ts',
			createResponse.files
		)

		const contents = diskUtil
			.readFile(builderPath)
			.replace("id: 'testSchema'", "id: 'test-schema'")

		diskUtil.writeFile(builderPath, contents)

		const syncResults = await this.Action('schema', 'sync').execute({})

		const testSchema = testUtil.assertFileByNameInGeneratedFiles(
			'test-schema.schema.ts',
			syncResults.files
		)

		const testSchemaContents = diskUtil.readFile(testSchema)
		assert.doesInclude(testSchemaContents, 'SchemaRegistry')

		await this.assertValidActionResponseFiles(syncResults)
	}

	@test()
	protected static async coreSchemasPullFromCoreSchemasModuleDuringNormalGeneration() {
		await this.syncSchemas('schemas')

		const createResponse = await this.Action('schema', 'create').execute({
			nameReadable: 'Test schema',
			nameCamel: 'testSchema',
		})

		for (const schema of Object.values(coreSchemas)) {
			const id = schema.id
			const match = testUtil.assertFileByNameInGeneratedFiles(
				`${id}.schema.ts`,
				createResponse.files
			)
			const contents = diskUtil.readFile(match)
			assert.doesInclude(
				contents,
				`export { ${id}Schema as default } from '@sprucelabs/spruce-core-schemas'`
			)
		}
	}

	@test()
	protected static async schemasStayInSyncWhenBuildersAreDeleted() {
		await this.syncSchemas('schemas')
		const version = versionUtil.generateVersion()
		const typeChecker = this.Service('typeChecker')
		const createAction = this.Action('schema', 'create')

		const matcher = new RegExp(
			`SpruceSchemas.TestingSchemas.${version.constValue}(.*?)interface TestSchema`,
			'gis'
		)

		assert.isTrue(
			diskUtil.doesFileExist(pathUtil.dirname(this.schemaTypesFile))
		)

		const createResponse = await createAction.execute({
			nameReadable: 'Test schema',
			nameCamel: 'testSchema',
		})

		const builderFile = testUtil.assertFileByNameInGeneratedFiles(
			/testSchema\.builder/,
			createResponse.files
		)

		// make sure builder is versioned
		assert.doesInclude(builderFile, version.dirValue)

		const schemaFile = testUtil.assertFileByNameInGeneratedFiles(
			/testSchema\.schema/,
			createResponse.files
		)

		// make sure this path is versioned
		assert.doesInclude(schemaFile, version.dirValue)
		assert.doesInclude(schemaFile, '/testingSchemas/')

		// schema types should be good
		await typeChecker.check(this.schemaTypesFile)

		// the types should include our test schema
		let typesContents = diskUtil.readFile(this.schemaTypesFile)
		assert.doesInclude(typesContents, matcher)

		// the schema file should exist
		assert.isTrue(diskUtil.doesFileExist(schemaFile))

		// DELETE builder and make sure we are cleaned up
		diskUtil.deleteFile(builderFile)

		// this should cleanup types and schema files
		await this.Action('schema', 'sync').execute({})

		assert.isTrue(diskUtil.doesFileExist(this.schemaTypesFile))

		// and the schema should have been deleted
		assert.isFalse(diskUtil.doesFileExist(schemaFile))

		// and the namespace folder should have been deleted
		const namespaceFolder = this.resolveHashSprucePath(
			'schemas',
			'testingSChemas'
		)
		assert.isFalse(diskUtil.doesDirExist(namespaceFolder))
	}

	@test()
	protected static async canSyncSchemasWhenOnlyNodeModuleIsInstalledAfterDecliningToInstallSkill() {
		await this.FeatureFixture().installCachedFeatures('schemasInNodeModule')

		const promise = this.Action('schema', 'sync').execute({})

		await this.waitForInput()

		await this.ui.sendInput('n')

		await this.waitForInput()

		await this.ui.sendInput('')

		const results = await promise

		assert.isFalsy(results.errors)
		await this.assertValidActionResponseFiles(results)
	}

	@test('syncs minArrayLength, importsWhenRemote')
	protected static async syncsExpectedFields() {
		await this.syncSchemas('schemas')

		const schemasDir = this.resolvePath('src', 'schemas')

		await diskUtil.copyDir(this.resolveTestPath('test_builders'), schemasDir)

		const results = await this.Action('schema', 'sync').execute({})
		const schema = await this.importSchema(results, 'schemaTwo.schema.ts')

		assert.isUndefined(schema.fields.phone.minArrayLength)
		assert.isEqual(schema.fields.favoriteColors.minArrayLength, 3)
		assert.isEqual(schema.fields.permissions.minArrayLength, 0)
	}

	@test()
	protected static async canChangeSkillNamespace() {
		await this.syncSchemas('schemas')

		await this.Action('schema', 'create').execute({
			nameReadable: 'Test schema',
			nameCamel: 'testSchema',
		})

		const beforeFolder = this.resolveHashSprucePath('schemas', 'testingSchemas')
		const afterFolder = this.resolveHashSprucePath('schemas', 'newNamespace')

		assert.isTrue(diskUtil.doesFileExist(beforeFolder))
		assert.isFalse(diskUtil.doesFileExist(afterFolder))

		await this.Store('skill').setCurrentSkillsNamespace('new-namespace')

		await this.Action('schema', 'sync').execute({})

		assert.isFalse(diskUtil.doesFileExist(beforeFolder))
		assert.isTrue(diskUtil.doesFileExist(afterFolder))
	}

	@test()
	protected static async generatedSchemasRetainImportsAndTypeSuffix() {
		await this.installSchemaFeature('schemas')

		const results = await this.Action('schema', 'create').execute({
			nameReadable: 'Test schema',
			nameCamel: 'testSchema',
		})

		const testSchemaPath = testUtil.assertFileByNameInGeneratedFiles(
			'testSchema.builder.ts',
			results.files
		)

		diskUtil.writeFile(
			testSchemaPath,
			`import { buildSchema } from '@sprucelabs/schema'

		export default buildSchema({
			id: 'testSchema',
			name: 'Test schema',
			description: '',
			importsWhenLocal: ['import * as Local from "@sprucelabs/schema"'],
			importsWhenRemote: ['import * as Remote from "@sprucelabs/schema"'],
			typeSuffix: '<S extends Record<string, any> = Record<string, any>>',
			fields: {
				fieldName1: {
					type: 'text',
					label: 'First Field',
					isRequired: true,
				},
				fieldName2: {
					type: 'number',
					label: 'Second Field',
					isRequired: true,
					hint: 'A hint',
				},
			},
		})
		`
		)

		const syncResults = await this.Action('schema', 'sync').execute({})

		const schemaPath = testUtil.assertFileByNameInGeneratedFiles(
			'testSchema.schema.ts',
			syncResults.files
		)

		const imported = await this.Service('import').importDefault(schemaPath)

		assert.doesInclude(imported, {
			importsWhenRemote: ['import * as Remote from "@sprucelabs/schema"'],
			typeSuffix: '<S extends Record<string, any> = Record<string, any>>',
		})
	}

	private static async importSchema(results: any, filename: string) {
		const file = testUtil.assertFileByNameInGeneratedFiles(
			filename,
			results.files
		)

		const schema = await this.Service('import').importDefault(file)

		return schema
	}

	private static async assertTypesFileGeneratesArraySelect(typesFile: string) {
		const contents = diskUtil.readFile(typesFile)
		assert.doesInclude(contents, `'favoriteColors'?: ("blue" | "red")[]`)
	}

	private static async copyMockCoreSchemas() {
		const source = this.resolveTestPath('mock_core_builders')
		const destination = this.resolvePath('src', 'schemas')

		await diskUtil.copyDir(source, destination)
	}
}
