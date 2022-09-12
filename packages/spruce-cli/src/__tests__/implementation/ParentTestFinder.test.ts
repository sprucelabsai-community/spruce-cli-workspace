import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import ParentTestFinder from '../../features/error/ParentTestFinder'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class ParentTestFinderTest extends AbstractCliTest {
	@test()
	protected static async canCreateFinder() {
		const finder = new ParentTestFinder(this.cwd)
		assert.isTruthy(finder)
	}

	@test()
	protected static async canFindAbstractTests() {
		await this.copyTestFiles()

		const testFinder = new ParentTestFinder(this.cwd)
		const matches = await testFinder.findAbstractTests()

		assert.isLength(matches, 3)
		assert.doesInclude(matches, {
			name: 'AbstractTest',
			path: this.resolvePath('src', 'AbstractTest.ts'),
		})

		assert.doesInclude(matches, {
			name: 'AbstractBananaTestDifferentThanFileName',
			path: this.resolvePath('src', 'deeper', 'AbstractBananaTest.ts'),
		})
	}

	private static async copyTestFiles() {
		const source = this.resolveTestPath('abstract_tests')
		const destination = this.resolvePath('src')

		await diskUtil.copyDir(source, destination)
	}
}
