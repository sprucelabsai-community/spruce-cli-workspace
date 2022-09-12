import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import LintService from '../../../services/LintService'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class TestingViewControllersTest extends AbstractSkillTest {
	protected static skillCacheKey = 'viewsWithTests'

	protected static async beforeEach() {
		await super.beforeEach()
		LintService.enableLinting()
	}

	@test()
	protected static async showsNotInstalled() {
		const viewFeature = this.cli.getFeature('view')
		viewFeature.isInstalled = async () => false

		void this.executeCreate()

		await this.waitForInput()

		const last = this.ui.getLastInvocation()
		assert.doesInclude(last.options.options.choices, {
			label: 'AbstractViewControllerTest (requires install)',
		})

		this.ui.reset()
	}

	@test()
	protected static async canSelectAbstractTest() {
		void this.executeCreate()

		await this.waitForInput()

		const last = this.ui.getLastInvocation()
		assert.doesInclude(last.options.options.choices, {
			label: 'AbstractViewControllerTest',
		})

		this.ui.reset()
	}

	@test()
	protected static async testsRun() {
		const promise = this.executeCreate()

		await this.waitForInput()

		this.selectOptionBasedOnLabel('AbstractViewControllerTest')

		const results = await promise

		assert.isFalsy(results.errors)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'RenderingRootViewController.test.ts',
			results.files
		)

		const contents = diskUtil.readFile(match)
		assert.doesInclude(
			contents,
			'RenderingRootViewControllerTest extends AbstractViewControllerTest'
		)
		assert.doesInclude(
			contents,
			"import { AbstractViewControllerTest } from '@sprucelabs/spruce-view-plugin'"
		)

		await this.Service('build').build()

		const testResults = await this.Action('test', 'test').execute({
			shouldReportWhileRunning: false,
		})

		assert.isArray(testResults.errors)
		assert.isLength(testResults.errors, 1)

		assert.doesInclude(testResults.meta?.testResults.testFiles, {
			path: 'behavioral/RenderingRootViewController.test.ts',
			status: 'failed',
		})
	}

	private static async executeCreate() {
		return this.Action('test', 'create').execute({
			type: 'behavioral',
			nameReadable: 'Rendering root view controller',
			nameCamel: 'renderingRootViewController',
			namePascal: 'RenderingRootViewController',
		})
	}
}
