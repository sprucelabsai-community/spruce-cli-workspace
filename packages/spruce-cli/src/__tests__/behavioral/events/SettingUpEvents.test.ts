import { test, assert } from '@sprucelabs/test-utils'
import AbstractEventTest from '../../../tests/AbstractEventTest'

export default class SettingUpEventsTest extends AbstractEventTest {
    @test()
    protected static async setsUpEvents() {
        const cli = await this.installEventFeature('events')
        const health = await cli.checkHealth()
        assert.isTruthy(health.event)
        assert.isEqual(health.event.status, 'passed')
    }
}
