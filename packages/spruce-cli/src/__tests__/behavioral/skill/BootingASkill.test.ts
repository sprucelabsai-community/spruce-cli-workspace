import { test, assert } from '@sprucelabs/test'
import findProcess from 'find-process'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class BootingASkillTest extends AbstractSkillTest {
	protected static skillCacheKey = 'skills'
	@test()
	protected static async bootingWithoutBuildingThrowsGoodError() {
		const results = await this.Action('skill', 'boot').execute({})

		assert.isTruthy(results.errors)
		assert.doesInclude(results.errors[0].message, /you must build/gis)
	}

	@test()
	protected static async aSkillCanBeBootedAndKilled() {
		await this.Service('build').build()

		const response = await this.Action('skill', 'boot').execute({})

		assert.isFalsy(response.errors)
		assert.isTrue(response.meta?.isBooted)

		const pid = response.meta?.pid
		assert.isAbove(pid, 0)

		const psResults = await findProcess('pid', pid)
		assert.isAbove(psResults.length, 0)

		response.meta?.kill()

		await this.wait(1000)

		const psResultsEmpty = await findProcess('pid', pid)
		assert.isLength(psResultsEmpty, 0)

		await response.meta?.promise
	}

	@test()
	protected static async canReturnFromExecuteImmediately() {
		const response = await this.Action('skill', 'boot').execute({
			shouldReturnImmediately: true,
		})

		assert.isFalse(response.meta?.isBooted)

		const bootResponse = await response.meta?.bootPromise

		assert.isEqual(bootResponse.meta.pid, response.meta.pid)
		assert.isTrue(bootResponse.meta?.isBooted)
	}
}
