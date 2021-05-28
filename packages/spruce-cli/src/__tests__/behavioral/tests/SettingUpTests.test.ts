import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { FeatureCode } from '../../../features/features.types'
import AbstractTestTest from '../../../tests/AbstractTestTest'

export default class SettingUpTestsTest extends AbstractTestTest {
	@test()
	protected static async installsTests() {
		await this.installTests()
		const code: FeatureCode = 'test'
		await this.assertIsFeatureInstalled(code)
	}

	@test()
	protected static async canRunTestsButSaysAtLeastOneTestIsNeeded() {
		await this.installTests()
		const command = this.Service('command')
		const err = await assert.doesThrowAsync(() => command.execute('yarn test'))

		errorAssertUtil.assertError(err, 'EXECUTING_COMMAND_FAILED')
		//@ts-ignore
		assert.doesInclude(err.options.stdout, /passWithNoTests/)
	}

	@test()
	protected static async creatingTestWithNoSkillAsksToInstallSkill() {
		const executer = this.Action('test', 'create')
		void executer.execute({})

		await this.waitForInput()

		assert.doesInclude(
			this.ui.lastInvocation().options.label,
			'Install the Skill feature'
		)

		this.ui.reset()
	}
}
