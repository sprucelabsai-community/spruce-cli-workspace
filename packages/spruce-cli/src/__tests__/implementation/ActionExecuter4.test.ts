import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { ENABLE_NPM_CACHE_COMMAND } from '../../features/cache/constants'
import CommandService from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class ActionExecuter4Test extends AbstractCliTest {
	protected static async beforeEach() {
		await super.beforeEach()

		CommandService.setMockResponse(/which docker/gis, {
			code: 0,
		})
		CommandService.setMockResponse(ENABLE_NPM_CACHE_COMMAND, {
			code: 0,
		})
	}

	@test('throws by default with will-execute listener error 1', 'test')
	@test('throws by default with will-execute listener error 2', 'test2')
	@test('throws by default with did-execute listener error 1', 'test2', 'did')
	protected static async canBeConfiguredToThrowWhenExecuteListenersReturnErrors(
		msg: string,
		willDid: 'will' | 'did' = 'will'
	) {
		this.getEmitter().on(`feature.${willDid}-execute`, () => {
			throw new Error(msg)
		})

		const err = await assert.doesThrowAsync(() =>
			this.Action('cache', 'enable').execute({})
		)

		errorAssertUtil.assertError(err, 'LISTENER_ERROR', {
			'originalError.message': msg,
		})
	}

	@test()
	protected static async stillReturnsIfNoErrorThrows() {
		await this.Action('cache', 'enable').execute({})
	}
}
