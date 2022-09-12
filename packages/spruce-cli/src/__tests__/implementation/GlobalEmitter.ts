import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class GlobalEmitterTest extends AbstractCliTest {
	@test()
	protected static async globalEmitterEmitsSEquentally() {
		const emitter = this.getEmitter()

		//@ts-ignore
		assert.isTrue(emitter.shouldEmitSequentally)
	}
}
