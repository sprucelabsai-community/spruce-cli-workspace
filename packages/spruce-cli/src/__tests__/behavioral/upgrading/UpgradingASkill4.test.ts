import fsUtil from 'fs'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import CommandService from '../../../services/CommandService'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingASkill4Test extends AbstractCliTest {
	protected static async beforeEach() {
		await super.beforeEach()
		CommandService.fakeCommand(new RegExp(/yarn rebuild/gis), {
			code: 0,
		})
	}

	@test()
	protected static async restoresMissingPackagesAndPlugins() {
		await this.FeatureFixture().installCachedFeatures('views')

		const features = this.Service('pkg', process.cwd()).get(
			'testSkillCache.everything'
		)

		const pkg = this.Service('pkg')
		const checks: { nodeModule?: string; plugin?: string }[] = []

		for (const feat of features) {
			const { code } = feat
			const nodeModule = `@sprucelabs/spruce-${code}-plugin`
			const path = this.resolveHashSprucePath('features', `${code}.plugin.ts`)
			const plugin = diskUtil.doesFileExist(path) ? path : undefined

			checks.push({
				nodeModule: pkg.get(['dependencies', nodeModule])
					? nodeModule
					: undefined,
				plugin,
			})
		}

		for (const check of checks) {
			if (check.nodeModule) {
				pkg.unset(['dependencies', check.nodeModule])
			}
			if (check.plugin) {
				diskUtil.deleteFile(check.plugin)
			}
		}

		CommandService.fakeCommand(/yarn clean/, { code: 0 })
		CommandService.fakeCommand(/yarn build.dev/, { code: 0 })

		await this.Action('node', 'upgrade').execute({})

		for (const check of checks) {
			if (check.nodeModule) {
				assert.isTruthy(
					pkg.get(['dependencies', check.nodeModule]),
					`${check.nodeModule} was not added back as a dependencies.`
				)
			}
			if (check.plugin) {
				assert.isTrue(
					diskUtil.doesFileExist(check.plugin),
					`${check.plugin} was not rewritten.`
				)
			}
		}
	}

	@test()
	protected static async doesNotAskIfNewScriptsAreAddedToSkillFeature() {
		const cli = await this.FeatureFixture().installCachedFeatures('skills')

		const pkg = this.Service('pkg')

		const skillFeature = cli.getFeature('skill')
		//@ts-ignore
		skillFeature.scripts['taco'] = 'bravo'

		await this.Action('node', 'upgrade').execute({})

		assert.isEqual(pkg.get(['scripts', 'taco']), 'bravo')

		this.assertSandboxListenerNotWritten()
	}

	@test()
	protected static async canOverwriteMultipleChangedScript() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const pkg = this.Service('pkg')
		pkg.set({ path: ['scripts', 'build.dev'], value: 'taco' })
		pkg.set({ path: ['scripts', 'watch.build.dev'], value: 'taco' })

		const promise = this.Action('node', 'upgrade').execute({})

		await this.waitForInput()

		let last = this.ui.getLastInvocation()

		assert.isEqual(last.command, 'prompt')
		await this.ui.sendInput('overwrite')

		last = this.ui.getLastInvocation()

		assert.isEqual(last.command, 'prompt')
		await this.ui.sendInput('overwrite')

		await promise

		assert.isNotEqual(pkg.get(['scripts', 'build.dev']), 'taco')
		assert.isNotEqual(pkg.get(['scripts', 'watch.build.dev']), 'taco')
	}

	protected static assertSandboxListenerNotWritten() {
		const listeners = this.resolvePath('src', 'listeners')
		if (!diskUtil.doesDirExist(listeners)) {
			return
		}
		const matches = fsUtil.readdirSync(listeners)
		assert.isLength(
			matches,
			0,
			'A sandbox listeners was written and it should not have been.'
		)
	}
}
