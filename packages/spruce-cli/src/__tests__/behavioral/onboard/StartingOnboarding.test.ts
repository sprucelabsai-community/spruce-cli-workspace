import { test, assert } from '@sprucelabs/test-utils'
import CliGlobalEmitter, { globalContract } from '../../../GlobalEmitter'
import CommandService from '../../../services/CommandService'
import AbstractCliTest from '../../../tests/AbstractCliTest'

class SpyEmitter extends CliGlobalEmitter {
    public static TestEmitter() {
        return new SpyEmitter(globalContract)
    }

    public hasListeners(eventName: string) {
        return !!this.listenersByEvent[eventName]
    }
}

export default class StartingOnboardingTest extends AbstractCliTest {
    @test()
    protected static async hasOnboardAction() {
        assert.isFunction(this.Action('onboard', 'onboard').execute)
    }

    @test()
    protected static async addsCommandListeners() {
        this.emitter = SpyEmitter.TestEmitter()

        await this.Cli()

        assert.isTrue(
            (this.emitter as SpyEmitter).hasListeners('feature.will-execute')
        )
    }

    @test()
    protected static async onboardingThroughSkillCreateThenShutsOff() {
        CommandService.fakeCommand(/yarn/, { code: 0 })

        const onboardAction = this.Action('onboard', 'onboard')
        const onboardPromise = onboardAction.execute({})

        // get through first onboarding script and select short onboarding
        await this.waitForInput()
        await this.ui.sendInput('\n')
        await this.waitForInput()
        await this.ui.sendInput('short')
        await this.waitForInput()
        await this.ui.sendInput('\n')

        await onboardPromise

        const onboardingStore = this.Store('onboarding')
        assert.isEqual(onboardingStore.getMode(), 'short')

        const createSkillAction = this.Action('skill', 'create', {
            shouldAutoHandleDependencies: true,
        })

        const createPromise = createSkillAction.execute({})

        // create skill confirmation
        await this.waitForInput()
        await this.ui.sendInput('\n')

        await this.wait(100)

        // install skill
        await this.waitForInput()

        await this.ui.sendInput('my new skill')

        await this.waitForInput()

        await this.ui.sendInput('a description')

        await createPromise

        //should still be on (will turn off after test reporter boots)
        assert.isEqual(onboardingStore.getMode(), 'short')
    }
}
