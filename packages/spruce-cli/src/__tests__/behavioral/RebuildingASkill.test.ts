import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import CommandService from '../../services/CommandService'
import AbstractSkillTest from '../../tests/AbstractSkillTest'

export default class RebuildingASkillTest extends AbstractSkillTest {
	protected static skillCacheKey = 'skills'

	@test()
	protected static async hasRebuildCommand() {
		assert.isFunction(this.Action('skill', 'rebuild').execute)
	}

	@test()
	protected static async runsExpectedCommand() {
		CommandService.setMockResponse('yarn rebuild', { code: 0 })

		const results = await this.Action('skill', 'rebuild').execute({
			shouldPlayGames: false,
		})

		assert.isFalsy(results.errors)
	}

	@test()
	protected static async handlesError() {
		CommandService.setMockResponse('yarn rebuild', { code: 1 })

		const results = await this.Action('skill', 'rebuild').execute({
			shouldPlayGames: false,
		})

		assert.isArray(results.errors)

		errorAssertUtil.assertError(results.errors[0], 'EXECUTING_COMMAND_FAILED')
	}
}
