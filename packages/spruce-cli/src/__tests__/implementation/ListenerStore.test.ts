import { fake } from '@sprucelabs/spruce-test-fixtures'
import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../tests/AbstractCliTest'

@fake.login()
export default class ListenerStoreTest extends AbstractCliTest {
	@test()
	protected static canCreateListenerStore() {
		const listenerStore = this.Store('listener')
		const expected = this.resolvePath('src', '**/*.listener.ts')
		//@ts-ignore
		assert.isEqual(expected, listenerStore.generateGlobbyPattern())
	}
}