import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../tests/AbstractCliTest'

class StoreFeature {}

export default class StoreFeatureTest extends AbstractCliTest {
	@test()
	protected static async canCreateStoreFeature() {
		const storeFeature = new StoreFeature()
		assert.isTruthy(storeFeature)
	}

	@test()
	protected static async yourNextTest() {
		assert.isTrue(false)
	}
}
