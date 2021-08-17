import { test, assert } from '@sprucelabs/test'
import ScriptUpdater from '../../features/skill/ScriptUpdater'
import AbstractSkillTest from '../../tests/AbstractSkillTest'

export default class RememberingUpgradeSelectionsTest extends AbstractSkillTest {
	protected static skillCacheKey = 'schemas'

	@test()
	protected static async changedScriptsHasAlwaysSkipOptions() {
		const expected = this.getExpectedBuildCi()
		const updater = this.ScriptUpdater('build.ci', 'taco')

		await this.assertShowsAlwaysSkipOption(updater)

		this.ui.sendInput('alwaysSkip')

		await this.wait(100)

		const pkg = this.Service('pkg')
		const ci = pkg.get(['scripts', 'build.ci'])

		assert.isEqual(ci, expected)
	}

	private static getExpectedBuildCi() {
		//@ts-ignore
		return this.getFeatureInstaller().getFeature('skill').scripts['build.ci']
	}

	@test()
	protected static async shouldNotAskASecondTime() {
		const updater = this.ScriptUpdater('build.ci', 'taco2')
		await updater.update()

		const expected = this.getExpectedBuildCi()
		const pkg = this.Service('pkg')
		const ci = pkg.get(['scripts', 'build.ci'])

		assert.isEqual(ci, expected)
	}

	@test()
	protected static async stillAsksAboutDifferentScript() {
		const updater = this.ScriptUpdater('build.dev', 'taco')
		await this.assertShowsAlwaysSkipOption(updater)

		this.ui.sendInput('alwaysSkip')
	}

	private static ScriptUpdater(key: string, value: string) {
		const updater = new ScriptUpdater({
			pkg: this.Service('pkg'),
			latestScripts: {
				[key]: value,
			},
			ui: this.ui,
			settings: this.Service('settings'),
		})
		return updater
	}

	private static async assertShowsAlwaysSkipOption(updater: ScriptUpdater) {
		void updater.update()

		await this.waitForInput()

		const last = this.ui.lastInvocation()

		assert.doesInclude(last, {
			'options.options.choices[].value': 'alwaysSkip',
		})
	}
}
