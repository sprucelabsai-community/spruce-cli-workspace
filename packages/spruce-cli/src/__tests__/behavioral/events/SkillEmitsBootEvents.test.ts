import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractEventTest from '../../../tests/AbstractEventTest'

export default class SkillEmitsBootEventsTest extends AbstractEventTest {
	@test()
	protected static async skillEmitsWillBootEvents() {
		await this.installEventFeature('events')
		const version = 'v2020_01_01'

		await this.Action('event', 'listen').execute({
			eventNamespace: 'skill',
			eventName: 'will-boot',
			version,
		})

		await this.Service('build').build()

		const response = await this.Action('skill', 'boot').execute({})
		assert.isTruthy(response.errors)
		errorAssertUtil.assertError(response.errors[0], 'LISTENER_NOT_IMPLEMENTED')
	}

	@test()
	protected static async skillEmitsDidBootEventsThatErrorAfterBoot() {
		await this.installEventFeature('events')
		const version = 'v2020_01_01'

		await this.Action('event', 'listen').execute({
			eventNamespace: 'skill',
			eventName: 'did-boot',
			version,
		})

		await this.Service('build').build()

		const response = await this.Action('skill', 'boot').execute({})
		const err = await assert.doesThrowAsync(() => response.meta?.promise)
		errorAssertUtil.assertError(err, 'LISTENER_NOT_IMPLEMENTED')
	}
}
