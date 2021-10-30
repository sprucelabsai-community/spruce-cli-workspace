import { eventDiskUtil } from '@sprucelabs/spruce-event-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import SyncAction from '../../../features/error/actions/SyncAction'
import UpdateDependenciesAction from '../../../features/node/actions/UpdateDependenciesAction'
import CommandService from '../../../services/CommandService'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import testUtil from '../../../tests/utilities/test.utility'
export default class UpgradingASkill2Test extends AbstractCliTest {
	private static originalErrorSyncExecute: any
	protected static async beforeEach() {
		if (!this.originalErrorSyncExecute) {
			this.originalErrorSyncExecute = SyncAction.prototype.execute
		} else {
			SyncAction.prototype.execute = this.originalErrorSyncExecute
		}

		await super.beforeEach()
		CommandService.setMockResponse(new RegExp(/yarn rebuild/gis), {
			code: 0,
		})
	}

	@test()
	protected static async doesNotAddResolvePathAliasesToDependenciesAfterUpgrade() {
		CommandService.clearMockResponses()
		await this.FeatureFixture().installCachedFeatures('views')

		await this.Action('node', 'upgrade').execute({})

		const dependencies = this.Service('pkg').get('dependencies')

		assert.isFalsy(dependencies['@sprucelabs/resolve-path-aliases'])
	}

	@test()
	protected static async featuresNotEnabledDontInstall() {
		CommandService.clearMockResponses()
		await this.FeatureFixture().installCachedFeatures('schemas')

		const results = await this.Action('node', 'upgrade').execute({})

		const dependencies = this.Service('pkg').get('dependencies')

		assert.isFalsy(dependencies['@sprucelabs/resolve-path-aliases'])

		assert.doesThrow(() =>
			testUtil.assertFileByNameInGeneratedFiles(
				'events.contract.ts',
				results.files
			)
		)

		this.assertViewPluginNotWritten()
	}

	@test()
	protected static async upgradingSkillSyncsEvents() {
		await this.FeatureFixture().installCachedFeatures('events')

		const results = await this.Action('node', 'upgrade').execute({})
		const events = eventDiskUtil.resolveCombinedEventsContractFile(this.cwd)

		assert.isTrue(diskUtil.doesFileExist(events))

		testUtil.assertFileByNameInGeneratedFiles(
			'events.contract.ts',
			results.files
		)
	}

	@test()
	protected static async upgradeCallsUpdateDependencies() {
		await this.FeatureFixture().installCachedFeatures('skills')

		UpdateDependenciesAction.prototype.execute = () => {
			throw new Error('baaaaad')
		}

		const results = await this.Action('node', 'upgrade').execute({})

		assert.isTruthy(results.errors)
		assert.doesInclude(results.errors[0].message, 'baaaaad')
	}

	@test()
	protected static async callsCleanFixLintAndBuildDev() {
		await this.FeatureFixture().installCachedFeatures('skills')

		let wasCleanBuildCalled = false
		UpdateDependenciesAction.prototype.execute = async () => {
			return {}
		}

		let wasFixLintCalled = false
		CommandService.setMockResponse('yarn clean.build', {
			code: 0,
			callback: () => {
				wasCleanBuildCalled = true
			},
		})

		CommandService.setMockResponse('yarn fix.lint', {
			code: 0,
			callback: () => {
				wasFixLintCalled = true
			},
		})

		let wasBuildDevCalled = false

		CommandService.setMockResponse('yarn build.dev', {
			code: 0,
			callback: () => {
				wasBuildDevCalled = true
			},
		})

		const results = await this.Action('node', 'upgrade').execute({})

		assert.isFalsy(results.errors)
		assert.isTrue(wasCleanBuildCalled)
		assert.isTrue(wasBuildDevCalled)
		assert.isTrue(wasFixLintCalled)
	}

	@test()
	protected static async writesViewPlugin() {
		await this.FeatureFixture().installCachedFeatures('views')

		const plugin = this.getViewsPluginPath()
		assert.isTrue(diskUtil.doesFileExist(plugin))

		diskUtil.deleteFile(plugin)

		assert.isFalse(diskUtil.doesFileExist(plugin))

		await this.Action('node', 'upgrade').execute({})

		assert.isTrue(diskUtil.doesFileExist(plugin))
	}

	@test('sync with errors installed')
	@test('sync with errors not installed', false)
	protected static async upgradeSyncsErrors(isInstalled = true) {
		await this.FeatureFixture().installCachedFeatures(
			isInstalled ? 'errors' : 'schemas'
		)

		let wasHit = false

		SyncAction.prototype.execute = async () => {
			wasHit = true
			return {}
		}

		this.disableCleanBuildAndYarnAdd()

		await this.Action('node', 'upgrade').execute({})

		assert.isEqual(wasHit, isInstalled)
	}

	@test()
	protected static async resetsErrorPluginInSkill() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const { plugin, expectedContents } = this.destroyErrorPlugin()

		await this.disableCleanBuildAndYarnAdd()

		const promise = this.Action('node', 'upgrade').execute({
			upgradeMode: 'askForChanged',
		})

		await this.waitForInput()
		await this.ui.sendInput('overwrite')

		await promise

		const actualContents = diskUtil.readFile(plugin)

		assert.isEqual(actualContents, expectedContents)
	}

	@test()
	protected static async resetsErrorPluginWhenErrorInstalled() {
		await this.FeatureFixture().installCachedFeatures('errors')

		await this.Action('error', 'create').execute({
			nameReadable: 'Test pass',
			nameCamel: 'testPass',
		})

		const { plugin, expectedContents } = this.destroyErrorPlugin()

		this.disableCleanAndBuild()

		const results = await this.Action('node', 'upgrade').execute({
			upgradeMode: 'askForChanged',
		})

		assert.isFalsy(results.errors)
		const actualContents = diskUtil.readFile(plugin)

		assert.isEqual(actualContents, expectedContents)
	}

	private static destroyErrorPlugin() {
		const plugin = this.resolveHashSprucePath('errors', 'options.types.ts')
		const expectedContents = diskUtil.readFile(plugin)

		diskUtil.writeFile(plugin, 'waka')
		return { plugin, expectedContents }
	}

	private static getViewsPluginPath() {
		return this.resolveHashSprucePath('features', 'view.plugin.ts')
	}

	protected static assertViewPluginNotWritten() {
		assert.isFalse(diskUtil.doesFileExist(this.getViewsPluginPath()))
	}

	private static disableCleanBuildAndYarnAdd() {
		this.disableCleanAndBuild()

		CommandService.setMockResponse(/yarn.*?add/gis, {
			code: 0,
		})
	}

	private static disableCleanAndBuild() {
		CommandService.setMockResponse('yarn clean.build', {
			code: 0,
		})

		CommandService.setMockResponse('yarn build.dev', {
			code: 0,
		})
	}
}
