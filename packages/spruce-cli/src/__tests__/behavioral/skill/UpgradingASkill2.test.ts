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

		await this.Action('skill', 'upgrade').execute({})

		const dependencies = this.Service('pkg').get('dependencies')

		assert.isFalsy(dependencies['@sprucelabs/resolve-path-aliases'])
	}

	@test()
	protected static async featuresNotEnabledDontInstall() {
		CommandService.clearMockResponses()
		await this.FeatureFixture().installCachedFeatures('schemas')

		const results = await this.Action('skill', 'upgrade').execute({})

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
		const results = await this.Action('skill', 'upgrade').execute({})

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

		const results = await this.Action('skill', 'upgrade').execute({})

		assert.isTruthy(results.errors)
		assert.doesInclude(results.errors[0].message, 'baaaaad')
	}

	@test()
	protected static async callsCleanAndBuildDev() {
		await this.FeatureFixture().installCachedFeatures('skills')

		let wasCleanBuildCalled = false
		UpdateDependenciesAction.prototype.execute = async () => {
			return {}
		}

		CommandService.setMockResponse('yarn clean.build', {
			code: 0,
			callback: () => {
				wasCleanBuildCalled = true
			},
		})

		let wasBuildDevCalled = false

		CommandService.setMockResponse('yarn build.dev', {
			code: 0,
			callback: () => {
				wasBuildDevCalled = true
			},
		})

		const results = await this.Action('skill', 'upgrade').execute({})

		assert.isFalsy(results.errors)
		assert.isTrue(wasCleanBuildCalled)
		assert.isTrue(wasBuildDevCalled)
	}

	@test()
	protected static async writesViewPlugin() {
		await this.FeatureFixture().installCachedFeatures('views')

		const plugin = this.getViewsPluginPath()
		assert.isTrue(diskUtil.doesFileExist(plugin))

		diskUtil.deleteFile(plugin)

		assert.isFalse(diskUtil.doesFileExist(plugin))

		await this.Action('skill', 'upgrade').execute({})

		assert.isTrue(diskUtil.doesFileExist(plugin))
	}

	@test.only()
	protected static async upgradeSyncsErrors() {
		await this.FeatureFixture().installCachedFeatures('errors')

		let wasHit = false

		SyncAction.prototype.execute = async () => {
			wasHit = true
			return {}
		}

		CommandService.setMockResponse('yarn clean.build', {
			code: 0,
		})

		CommandService.setMockResponse('yarn build.dev', {
			code: 0,
		})

		CommandService.setMockResponse(/yarn.*?add/gis, {
			code: 0,
		})

		await this.Action('skill', 'upgrade').execute({})

		assert.isTrue(wasHit)
	}

	private static getViewsPluginPath() {
		return this.resolveHashSprucePath('features', 'view.plugin.ts')
	}

	protected static assertViewPluginNotWritten() {
		assert.isFalse(diskUtil.doesFileExist(this.getViewsPluginPath()))
	}
}
