import { test, assert } from '@sprucelabs/test'
import CommandService from '../../../services/CommandService'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingASkill4Test extends AbstractCliTest {
	@test()
	protected static async upgradeResetsEventCache() {
		await this.installSetListenerCacheAndBlockExecute()

		await assert.doesThrowAsync(() =>
			this.Action('node', 'upgrade').execute({})
		)

		const value = this.Settings().getListenerCache()
		assert.isFalsy(value)
	}

	@test()
	protected static async doesNotResetEventCacheWithOtherAction() {
		await this.installSetListenerCacheAndBlockExecute()

		await assert.doesThrowAsync(() => this.Action('schema', 'sync').execute({}))

		const value = this.Settings().getListenerCache()
		assert.isEqualDeep(value, { shouldBeDeleted: true })
	}

	@test()
	protected static async shouldSyncSchemasIfSchemasIsInstalled() {
		await this.FeatureFixture().installCachedFeatures('schemas')

		CommandService.setMockResponse(new RegExp(/yarn/gis), {
			code: 0,
		})

		const emitter = this.getEmitter()

		let wasHit = false

		await emitter.on('feature.will-execute', (payload) => {
			if (payload.featureCode === 'schema' && payload.actionCode === 'sync') {
				wasHit = true
			}

			return {}
		})

		await this.Action('node', 'upgrade').execute({})

		assert.isTrue(wasHit)
	}

	private static async installSetListenerCacheAndBlockExecute() {
		await this.FeatureFixture().installCachedFeatures('events')

		const settings = this.Settings()
		settings.setListenerCache({ shouldBeDeleted: true })

		const emitter = this.getEmitter()
		void emitter.on('feature.will-execute', () => {
			throw new Error('Stop!')
		})
	}

	private static Settings() {
		return this.Service('eventSettings')
	}
}
