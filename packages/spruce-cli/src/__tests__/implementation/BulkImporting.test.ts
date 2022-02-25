import pathUil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractSpruceTest, { test, assert } from '@sprucelabs/test'
import { errorAssert } from '@sprucelabs/test-utils'
import ImportService from '../../services/ImportService'
import ServiceFactory from '../../services/ServiceFactory'

export default class BulkImportingTest extends AbstractSpruceTest {
	private static importer: ImportService

	protected static async beforeEach() {
		// await super.beforeEach()
		const factory = new ServiceFactory()
		this.importer = factory.Service(this.cwd, 'import')

		const tmpDir = this.resolvePath('.tmp')
		diskUtil.deleteDir(tmpDir)
	}

	@test()
	protected static async importerHasBulkImportMethod() {
		assert.isFunction(this.importer.bulkImport)
	}

	@test()
	protected static async canImportSingleFile() {
		const [schemaOne] = await this.importer.bulkImport([
			this.resolveTestPath('test_builders/v2020_06_23/schemaOne.builder.ts'),
		])

		assert.isTruthy(schemaOne)
		assert.isTruthy(schemaOne.id)
		assert.isEqual(schemaOne.id, 'schemaOne')
	}

	@test()
	protected static async importingNothingGoesFast() {
		const results = await this.importer.bulkImport([])
		assert.isLength(results, 0)
	}

	@test()
	protected static async canImportTwoFiles() {
		const [schemaOne, schemaTwo] = await this.importer.bulkImport([
			this.resolveTestPath('test_builders/v2020_06_23/schemaOne.builder.ts'),
			this.resolveTestPath('test_builders/v2020_06_23/schemaTwo.builder.ts'),
		])

		assert.isTruthy(schemaOne)
		assert.isTruthy(schemaTwo)
		assert.isTruthy(schemaTwo.id, 'schemaTwo')
	}

	@test()
	protected static async shouldCleanupTmpDir() {
		await this.importer.bulkImport([
			this.resolveTestPath('test_builders/v2020_06_23/schemaOne.builder.ts'),
			this.resolveTestPath('test_builders/v2020_06_23/schemaTwo.builder.ts'),
		])

		const tmpDir = this.resolvePath('.tmp')
		assert.isFalse(diskUtil.doesDirExist(tmpDir))
	}

	@test()
	protected static async cleansUpOnError() {
		await assert.doesThrowAsync(() =>
			this.importer.bulkImport([
				this.resolveTestPath(
					'test_builders_one_bad/v2020_06_23/badSchema.builder.ts'
				),
			])
		)

		const tmpDir = this.resolvePath('.tmp')
		assert.isFalse(diskUtil.doesDirExist(tmpDir))
	}

	@test()
	protected static async throwsOnTheActualFileWithAnError() {
		const err = await assert.doesThrowAsync(() =>
			this.importer.bulkImport([
				this.resolveTestPath(
					'test_builders_one_bad/v2020_06_23/badSchema.builder.ts'
				),
			])
		)

		errorAssert.assertError(err, 'FAILED_TO_IMPORT')
		assert.doesInclude((err as any).options.file, 'badSchema.builder.ts')
	}

	@test()
	protected static async throwsOnTheFirstActualFileWithAnErrorWithManyFiles() {
		const err = await assert.doesThrowAsync(() =>
			this.importer.bulkImport([
				this.resolveTestPath(
					'test_builders_two_bad/v2020_06_23/anotherBad.builder.ts'
				),
				this.resolveTestPath(
					'test_builders_two_bad/v2020_06_23/badSchema.builder.ts'
				),

				this.resolveTestPath('test_builders/v2020_06_23/schemaTwo.builder.ts'),
				this.resolveTestPath('test_builders/v2020_06_23/schemaOne.builder.ts'),
			])
		)

		errorAssert.assertError(err, 'FAILED_TO_IMPORT')
		assert.doesInclude((err as any).options.file, 'anotherBad.builder.ts')
	}

	@test()
	protected static async helpfulErrorWhenImportNotExportedAsDefault() {
		const err = await assert.doesThrowAsync(() =>
			this.importer.bulkImport([
				this.resolveTestPath('test_builders/v2020_06_23/schemaTwo.builder.ts'),
				this.resolveTestPath('test_builders/v2020_06_23/schemaOne.builder.ts'),
				this.resolveTestPath(
					'test_builders_two_bad/v2020_06_23/notDefault.builder.ts'
				),
			])
		)

		errorAssert.assertError(err, 'FAILED_TO_IMPORT')
		assert.doesInclude((err as any).options.file, 'notDefault.builder.ts')
	}

	protected static resolveTestPath(...pathAfterTestDirsAndFiles: string[]) {
		return pathUil.join(
			this.cwd,
			'build',
			'__tests__',
			'testDirsAndFiles',
			...pathAfterTestDirsAndFiles
		)
	}
}
