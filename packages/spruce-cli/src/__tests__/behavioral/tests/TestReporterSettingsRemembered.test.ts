import { test, assert } from '@sprucelabs/test-utils'
import TestAction from '../../../features/test/actions/TestAction'
import AbstractTestTest from '../../../tests/AbstractTestTest'

export default class TestReporterSettingsRememberedTest extends AbstractTestTest {
    @test()
    protected static emptyToMakeThingsPassForSomeReason() {}

    @test()
    protected static async watchSettingsRemembered() {
        await this.FeatureFixture().installCachedFeatures('tests')
        const settings = this.Service('settings')

        settings.set('test.watchMode', 'smart')

        const action = this.Action('test', 'test')

        const results = await action.execute({
            shouldReturnImmediately: true,
            shouldReportWhileRunning: false,
        })

        const meta = (results as any).meta
        const test = meta.test as TestAction

        assert.isTruthy(test)

        assert.isEqual(test.getWatchMode(), 'smart')
        test.kill()

        await meta.promise
    }

    @test()
    protected static async watchSettingsSaved() {
        await this.FeatureFixture().installCachedFeatures('tests')

        const action = this.Action('test', 'test')

        const results = await action.execute({
            shouldReturnImmediately: true,
            shouldReportWhileRunning: false,
        })

        const meta = (results as any).meta
        const test = meta.test as TestAction

        const settings = this.Service('settings')
        assert.isUndefined(settings.get('test.watchMode'))

        test.setWatchMode('smart')

        assert.isEqual(test.getWatchMode(), 'smart')

        test.kill()

        await meta.promise
    }
}
