import { test, assert } from '@sprucelabs/test'
import CommandService from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class StoreFeatureTest extends AbstractCliTest {
	@test()
	protected static async syncsOnWillExecute() {
		await this.FeatureFixture().installCachedFeatures('stores')

		CommandService.fakeCommand(/yarn/, {
			code: 0,
		})

		let hitCount = 0
		const emitter = this.getEmitter()
		await emitter.on(
			'feature.will-execute',
			async ({ featureCode, actionCode }) => {
				if (featureCode === 'store' && actionCode === 'sync') {
					hitCount++
				}
			}
		)

		await emitter.emit('feature.will-execute', {
			featureCode: 'node',
			actionCode: 'upgrade',
		})

		assert.isEqual(hitCount, 0)

		await emitter.emit('feature.did-execute', {
			featureCode: 'node',
			actionCode: 'upgrade',
			results: {},
		})

		assert.isEqual(hitCount, 1)
	}
}
