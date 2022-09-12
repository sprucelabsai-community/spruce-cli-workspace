import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
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
		CommandService.fakeCommand('yarn rebuild', { code: 0 })

		const results = await this.Action('skill', 'rebuild').execute({
			shouldPlayGames: false,
		})

		assert.isFalsy(results.errors)
	}

	@test()
	protected static async handlesError() {
		CommandService.fakeCommand('yarn rebuild', { code: 1 })

		const results = await this.Action('skill', 'rebuild').execute({
			shouldPlayGames: false,
		})

		assert.isArray(results.errors)

		errorAssert.assertError(results.errors[0], 'EXECUTING_COMMAND_FAILED')
	}
}
