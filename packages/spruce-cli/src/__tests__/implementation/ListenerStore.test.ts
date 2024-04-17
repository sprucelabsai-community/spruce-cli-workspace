import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class ListenerStoreTest extends AbstractCliTest {
    @test()
    protected static canCreateListenerStore() {
        const listenerStore = this.Store('listener')
        const expected = this.resolvePath('src', '**/*.listener.ts')
        //@ts-ignore
        assert.isEqual(expected, listenerStore.generateGlobbyPattern())
    }
}
