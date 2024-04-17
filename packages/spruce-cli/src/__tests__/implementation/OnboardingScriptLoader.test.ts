import { test, assert } from '@sprucelabs/test-utils'
import ScriptLoader from '../../features/onboard/ScriptLoader'
import ScriptPlayer from '../../features/onboard/ScriptPlayer'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class OnboardingScriptLoaderTest extends AbstractCliTest {
    private static commandExecuterCommands: string[] = []

    @test()
    protected static scripLoaderLoadScriptsFunction() {
        assert.isFunction(ScriptLoader.LoadScripts)
    }

    @test()
    protected static async loadingScriptsReturnsPlayer() {
        const player = await this.Player()
        assert.isTrue(player instanceof ScriptPlayer)
    }

    private static async Player() {
        return await ScriptLoader.LoadScripts({
            ui: this.ui,
            dir: this.resolveTestPath('../support/scripts'),
            onboardingStore: this.Store('onboarding'),
            commandExecuter: async (command: string) => {
                this.commandExecuterCommands.push(command)
            },
        })
    }

    @test()
    protected static async playsLoadedScripts() {
        const player = await this.Player()

        await player.playScriptWithKey('first')

        assert.doesInclude(this.ui.invocations, {
            command: 'renderLine',
            options: { message: 'hello world' },
        })

        assert.doesInclude(this.ui.invocations, {
            command: 'renderLine',
            options: { message: 'second script' },
        })

        assert.doesInclude(this.ui.invocations, {
            command: 'renderLine',
            options: { message: 'the last script' },
        })

        assert.isLength(this.commandExecuterCommands, 1)
        assert.isEqual(
            this.commandExecuterCommands[0],
            'first script command executed'
        )
    }
}
