import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractErrorTest from '../../../tests/AbstractErrorTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class KeepsErrorClassInSyncTest extends AbstractErrorTest {
	@test()
	protected static async errorFileShouldBeCreatedAndPassed() {
		await this.installErrorFeature('errors')
		const createAction = this.Action('error', 'create')

		const results = await createAction.execute({
			nameReadable: 'Test error',
			nameCamel: 'testError',
		})

		testUtil.assertFileByNameInGeneratedFiles(/SpruceError/, results.files)

		assert.doesInclude(results.files ?? [], {
			name: 'SpruceError.ts',
			action: 'updated',
		})

		for (const file of results.files ?? []) {
			await this.Service('typeChecker').check(file.path)
		}
	}

	@test()
	protected static async errorFileShouldBeUpdated() {
		await this.installErrorFeature('errors')
		const createAction = this.Action('error', 'create')
		await createAction.execute({
			nameCamel: 'testError1',
			nameReadable: 'Test error 1',
		})
		const results = await createAction.execute({
			nameCamel: 'testError2',
			nameReadable: 'Test Error 2',
		})

		const match = testUtil.assertFileByNameInGeneratedFiles(
			/SpruceError/,
			results.files
		)
		const contents = diskUtil.readFile(match)

		assert.doesInclude(contents, "'TEST_ERROR_1'")
		assert.doesInclude(contents, "'TEST_ERROR_2'")

		await this.Service('typeChecker').check(match)
	}
}
