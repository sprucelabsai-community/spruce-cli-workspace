import { test, assert } from '@sprucelabs/test'
import AbstractEventTest from '../../../tests/AbstractEventTest'

export default class KeepingListenersInSyncTest extends AbstractEventTest {
	@test()
	protected static async hasSyncAction() {
		assert.isFunction(this.Action('event', 'sync.listeners').execute)
	}
}
