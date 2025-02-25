import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import { ENABLE_NPM_CACHE_COMMAND } from '../../features/cache/constants'
import CommandServiceImpl from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class ActionExecuter4Test extends AbstractCliTest {
    protected static async beforeEach() {
        await super.beforeEach()

        CommandServiceImpl.fakeCommand(/which docker/gis, {
            code: 0,
        })
        CommandServiceImpl.fakeCommand(ENABLE_NPM_CACHE_COMMAND, {
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
        await this.emitter.on(`feature.${willDid}-execute`, () => {
            throw new Error(msg)
        })

        const err = await assert.doesThrowAsync(() =>
            this.Action('cache', 'enable').execute({})
        )

        errorAssert.assertError(err, 'LISTENER_ERROR', {
            'originalError.message': msg,
        })
    }

    @test()
    protected static async stillReturnsIfNoErrorThrows() {
        await this.Action('cache', 'enable').execute({})
    }
}
