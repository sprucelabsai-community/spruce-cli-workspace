import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingASkill4Test extends AbstractCliTest {
	@test()
	protected static async upgradeResetsEventCache() {
		const settings = await this.installSetListenerCacheAndBlockExecute()

		await assert.doesThrowAsync(() =>
			this.Action('node', 'upgrade').execute({})
		)

		const value = settings.getListenerCache()
		assert.isFalsy(value)
	}

	@test()
	protected static async doesNotResetWithOtherAction() {
		const settings = await this.installSetListenerCacheAndBlockExecute()

		await assert.doesThrowAsync(() => this.Action('schema', 'sync').execute({}))

		const value = settings.getListenerCache()
		assert.isEqualDeep(value, { shouldBeDeleted: true })
	}

	private static async installSetListenerCacheAndBlockExecute() {
		await this.FeatureFixture().installCachedFeatures('events')

		const settings = this.Service('eventSettings')
		settings.setListenerCache({ shouldBeDeleted: true })

		const emitter = this.getEmitter()
		void emitter.on('feature.will-execute', () => {
			throw new Error('Stop!')
		})
		return settings
	}
}
