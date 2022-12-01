import { test, assert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class ListeningToCoreEventsTest extends AbstractSkillTest {
	protected static skillCacheKey = 'events'

	@test()
	protected static async canListenToDidInstallWithoutErroring() {
		const results = await this.Action('event', 'listen').execute({
			eventName: 'did-install',
			namespace: 'mercury',
			version: 'v2020_12_25',
		})

		assert.isFalsy(results.errors?.[0])
	}

	@test()
	protected static async canBootASkillWithACoreListener() {
		await this.getSkillFixture().registerCurrentSkill({
			name: 'global listen test',
		})
		const response = await this.Action('skill', 'boot').execute({ local: true })
		assert.isFalsy(response.errors)
	}
}
