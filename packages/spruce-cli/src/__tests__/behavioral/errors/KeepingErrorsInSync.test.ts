import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert, test } from '@sprucelabs/test-utils'
import ImportService from '../../../services/ImportService'
import AbstractErrorTest from '../../../tests/AbstractErrorTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class KeepingErrorsInSyncTest extends AbstractErrorTest {
	@test()
	protected static async hasSyncErrorAction() {
		await this.Cli()
		assert.isFunction(this.Action('error', 'sync').execute)
	}

	@test()
	protected static async returnsHelpfulErrorWhenTsNodeIsRemoved() {
		await this.installErrorFeature('errors')

		const createAction = this.Action('error', 'create')

		await createAction.execute({
			nameReadable: 'Test error',
			nameCamel: 'testError',
		})

		const pkg = this.Service('pkg')
		await pkg.uninstall('ts-node')

		ImportService.clearCache()

		const results = await this.Action('error', 'sync').execute({})

		assert.isTruthy(results.errors)
		assert.isLength(results.errors, 1)
	}

	@test()
	protected static async errorsStayInSyncWhenSchemasAreDeleted() {
		await this.installErrorFeature('errors')

		const createAction = this.Action('error', 'create')

		const results = await createAction.execute({
			nameReadable: 'Test error',
			nameCamel: 'testError',
		})

		const optionsMatch = testUtil.assertFileByNameInGeneratedFiles(
			/^options\.types/,
			results.files
		)

		await this.Service('typeChecker').check(optionsMatch)

		const typesMatch = testUtil.assertFileByNameInGeneratedFiles(
			/^errors\.types/,
			results.files
		)

		// should contain our test error
		let optionsContent = diskUtil.readFile(optionsMatch)
		assert.doesInclude(optionsContent, /SpruceErrors\.TestingErrors\.TestError/)

		let typesContent = diskUtil.readFile(typesMatch)
		assert.doesInclude(
			typesContent,
			/SpruceErrors\.TestingErrors.*?TestError/gis
		)

		// delete our testError
		const builderMatch = testUtil.assertFileByNameInGeneratedFiles(
			/testError\.builder/,
			results.files
		)

		diskUtil.deleteFile(builderMatch)

		// resync
		await this.Action('error', 'sync').execute({})

		// #spruce/errors should not exist
		assert.isFalse(diskUtil.doesFileExist(this.resolveHashSprucePath('errors')))

		// build 2 errors
		const testError1 = await createAction.execute({
			nameCamel: 'testError1',
			nameReadable: 'Test error 1',
		})

		const testError1SchemaMatch = testUtil.assertFileByNameInGeneratedFiles(
			'testError1.schema',
			testError1.files
		)

		const testError1BuilderMatch = testUtil.assertFileByNameInGeneratedFiles(
			'testError1.builder',
			testError1.files
		)

		await createAction.execute({
			nameCamel: 'testError2',
			nameReadable: 'Test error 2',
		})

		// #spruce/errors should exist
		assert.isTrue(diskUtil.doesFileExist(this.resolveHashSprucePath('errors')))

		typesContent = diskUtil.readFile(this.errorTypesFile)

		// types should include both
		assert.doesInclude(
			typesContent,
			/SpruceErrors\.TestingErrors.*?TestError1/gis
		)
		assert.doesInclude(
			typesContent,
			/SpruceErrors\.TestingErrors.*?TestError2/gis
		)

		// definition file for testError1
		assert.isTrue(diskUtil.doesFileExist(testError1SchemaMatch))

		// delete builder 1
		diskUtil.deleteFile(testError1BuilderMatch)
		assert.isFalse(diskUtil.doesFileExist(testError1BuilderMatch))

		// sync
		await this.Action('error', 'sync').execute({})

		// types should no longer include test error 1
		typesContent = diskUtil.readFile(this.errorTypesFile)
		assert.doesNotInclude(
			typesContent,
			/SpruceErrors\.TestingErrors.*?TestError1/
		)

		// the definition file should be gone now
		assert.isFalse(diskUtil.doesFileExist(testError1SchemaMatch))
	}

	@test()
	protected static async canHandleNestedSchemasWithoutAddingThemToOptions() {
		await this.installErrorFeature('errors')
		const source = this.resolveTestPath('nested_error_schemas')
		const destination = this.resolvePath('src/errors')

		await diskUtil.copyDir(source, destination)

		const results = await this.Action('error', 'sync').execute({})
		const errorTypesFile = testUtil.assertFileByNameInGeneratedFiles(
			/errors\.types/,
			results.files
		)

		const typeChecker = this.Service('typeChecker')
		await typeChecker.check(errorTypesFile)

		const errorOptionsFile = testUtil.assertFileByNameInGeneratedFiles(
			/options\.types/,
			results.files
		)

		const contents = diskUtil.readFile(errorOptionsFile)
		assert.doesNotInclude(contents, 'INestedSchema')

		const errorClassFile = testUtil.assertFileByNameInGeneratedFiles(
			'SpruceError.ts',
			results.files
		)
		let classContents = diskUtil.readFile(errorClassFile)
		assert.doesNotInclude(classContents, /NESTED_SCHEMA/)

		const createAction = this.Action('error', 'create')
		await createAction.execute({
			nameCamel: 'testError2',
			nameReadable: 'Test error 2',
		})

		const syncResults = await this.Action('error', 'sync').execute({})

		classContents = diskUtil.readFile(errorClassFile)
		assert.doesNotInclude(classContents, /NESTED_SCHEMA/)

		await this.assertValidActionResponseFiles(syncResults)

		const parentSchema = testUtil.assertFileByNameInGeneratedFiles(
			'good.schema.ts',
			syncResults.files
		)

		const parentSchemaContents = diskUtil.readFile(parentSchema)

		assert.doesNotInclude(parentSchemaContents, this.cwd)
	}

	@test()
	protected static async canCreateAndSyncErrorsWithNoCoreSchemasAndNoFields() {
		await this.installErrorFeature('errors')

		const createAction = this.Action('error', 'create')

		const results = await createAction.execute({
			nameReadable: 'Test error',
			nameCamel: 'testError',
			shouldFetchCoreSchemas: false,
		})

		assert.isFalsy(results.errors)
		assert.isTruthy(results.files)
		diskUtil.writeFile(
			results.files[0].path,
			`import { buildErrorSchema } from '@sprucelabs/schema'


		export default buildErrorSchema({
			id: 'testError',
			name: 'Test error',
			description: '',
			fields: {
			}
		})`
		)

		const syncAction = this.Action('error', 'sync')
		const syncResults = await syncAction.execute({
			shouldFetchCoreSchemas: false,
		})
		assert.isFalsy(syncResults.errors)
	}
}
