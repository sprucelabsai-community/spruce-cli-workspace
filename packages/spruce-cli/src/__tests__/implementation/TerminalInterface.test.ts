import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
} from '@sprucelabs/test-utils'
import TerminalInterface from '../../interfaces/TerminalInterface'

export default class TerminalInterfaceTest extends AbstractSpruceTest {
    private static wasOraHit: boolean
    private static ui: TerminalInterface

    protected static async beforeEach() {
        await super.beforeEach()

        process.env.IS_TESTING_SELF = 'true'

        this.wasOraHit = false
        //@ts-ignore
        TerminalInterface.ora = () => {
            this.wasOraHit = true
            return {
                start: () => {},
                stop: () => {},
            }
        }

        this.ui = new TerminalInterface(this.cwd)
    }

    protected static async afterEach(): Promise<void> {
        await super.afterEach()
        await this.wait(100)
    }

    @test()
    protected static async dontShowProgressIfPrompting() {
        this.prompt()
        await this.startLoading()
        assert.isFalse(this.wasOraHit)
    }

    @test()
    protected static async startsLoadingAsExpectedIfNotPrompting() {
        await this.startLoading()
        assert.isTrue(this.wasOraHit)
    }

    @test()
    protected static async askingToPromptThrowsIfInCi() {
        delete process.env.IS_TESTING_SELF
        process.env.CIRCLECI = 'true'
        const err = await assert.doesThrowAsync(() =>
            this.ui.prompt({ type: 'text' })
        )
        errorAssert.assertError(err, 'CANNOT_PROMPT_IN_CI')
    }

    private static async startLoading() {
        await this.ui.startLoading()
    }

    private static prompt() {
        void this.ui.prompt({
            type: 'text',
        })
    }
}
