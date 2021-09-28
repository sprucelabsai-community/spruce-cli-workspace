import { test, assert } from '@sprucelabs/test'
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
