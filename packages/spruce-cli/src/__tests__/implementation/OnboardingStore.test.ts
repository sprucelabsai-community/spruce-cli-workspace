import { test, assert } from '@sprucelabs/test-utils'
import featuresUtil from '../../features/feature.utilities'
import OnboardingStore from '../../features/onboard/stores/OnboardingStore'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class OnboardingStoreTest extends AbstractCliTest {
    private static store: OnboardingStore

    protected static async beforeEach() {
        await super.beforeEach()

        const store = this.OnboardingStore()
        this.store = store
    }

    private static OnboardingStore() {
        const store = this.Store('onboarding')
        return store
    }

    @test()
    protected static canGetStore() {
        assert.isTruthy(this.store)
    }

    @test()
    protected static startsAsOff() {
        const mode = this.store.getMode()
        assert.isEqual(mode, 'off')
    }

    @test()
    protected static canSetToShortMode() {
        this.store.setMode('short')
        assert.isEqual(this.store.getMode(), 'short')
    }

    @test()
    protected static canSetToImmersiveMode() {
        this.store.setMode('immersive')
        assert.isEqual(this.store.getMode(), 'immersive')
    }

    @test()
    protected static remembersModeBetweenBoots() {
        this.store.setMode('immersive')

        const newStore = this.OnboardingStore()
        assert.isEqual(newStore.getMode(), 'immersive')
    }

    @test()
    protected static async remembersStageBetweenBoots() {
        const stage = featuresUtil.generateCommand('test', 'test') as 'test'

        this.store.setStage(stage)

        const newStore = this.OnboardingStore()
        assert.isEqual(newStore.getStage(), stage)
    }

    @test()
    protected static valuesSharedBetween2Instances() {
        const store1 = this.OnboardingStore()
        const store2 = this.OnboardingStore()

        store1.setMode('immersive')
        assert.isEqual(store2.getMode(), store1.getMode())
    }

    @test()
    protected static stageIsNotSetToStart() {
        const currentStage = this.store.getStage()
        assert.isFalsy(currentStage)
    }

    @test()
    protected static stageCanBeSet() {
        this.store.setStage('test')
        const stage = this.store.getStage()
        assert.isEqual(stage, 'test')
    }

    @test()
    protected static canBeReset() {
        this.store.setStage('test')
        this.store.reset()

        const stage = this.store.getStage()

        assert.isFalsy(stage)
        assert.isEqual(this.store.getMode(), 'off')
    }

    @test()
    protected static cantSetBadStage() {
        //@ts-ignore
        assert.doesThrow(() => this.store.setStage('taco'))
    }
}
