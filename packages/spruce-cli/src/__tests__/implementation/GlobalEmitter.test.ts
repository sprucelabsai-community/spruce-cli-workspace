import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class GlobalEmitterTest extends AbstractCliTest {
	@test()
	protected static async globalEmitterEmitsEquentally() {
		//@ts-ignore
		assert.isTrue(this.emitter.shouldEmitSequentally)
	}
}
