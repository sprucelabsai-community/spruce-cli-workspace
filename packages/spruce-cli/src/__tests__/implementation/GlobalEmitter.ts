import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class GlobalEmitterTest extends AbstractCliTest {
	@test()
	protected static async willExecuteFiresSequentally() {
		const emitter = this.getEmitter()

		//@ts-ignore
		assert.isTrue(emitter.shouldEmitSequentally)
	}
}
