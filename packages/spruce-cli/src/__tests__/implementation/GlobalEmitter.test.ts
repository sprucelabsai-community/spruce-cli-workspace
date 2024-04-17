import { test, assert, generateId } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class GlobalEmitterTest extends AbstractCliTest {
    @test()
    protected static async globalEmitterEmitsEquentally() {
        //@ts-ignore
        assert.isTrue(this.emitter.shouldEmitSequentally)
    }

    @test()
    protected static async didExecuteAcceptsInstalledPackages() {
        await this.emitter.on('feature.did-execute', () => {
            return {
                packagesInstalled: [
                    {
                        isDev: true,
                        name: generateId(),
                        version: generateId(),
                    },
                ],
            }
        })

        await this.emitter.emitAndFlattenResponses('feature.did-execute', {
            actionCode: generateId(),
            featureCode: 'permission',
            results: {},
        })
    }
}
