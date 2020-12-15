import { eventResponseUtil } from '@sprucelabs/mercury-types'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractPersonTest from '../../../tests/AbstractPersonTest'

export default class RegisteringASkillTest extends AbstractPersonTest {
	@test()
	protected static async hasRegisterAction() {
		const cli = await this.Cli()
		assert.isFunction(cli.getFeature('skill').Action('register').execute)
	}

	@test()
	protected static async cantRegisterWithoutBeingLoggedIn() {
		const cli = await this.FeatureFixture().installCachedFeatures('skills')

		const results = await cli.getFeature('skill').Action('register').execute({
			nameReadable: 'My great skill',
			nameKebab: 'my-great-skill',
		})

		assert.isTruthy(results.errors)
		errorAssertUtil.assertError(results.errors[0], 'MERCURY_RESPONSE_ERROR')
		errorAssertUtil.assertError(
			results.errors[0].options.responseErrors[0],
			'UNAUTHORIZED_ACCESS'
		)
	}

	@test()
	protected static async canRegisterSkill() {
		const { cli } = await this.installSkillAndLoginAsDummyPerson()
		const slug = `my-new-skill-${new Date().getTime()}`
		const results = await cli.getFeature('skill').Action('register').execute({
			nameReadable: 'my new skill',
			nameKebab: slug,
		})

		assert.isFalsy(results.errors)
		const skill = results.meta?.skill
		assert.isTruthy(skill)

		const client = await this.connectToApi()
		const getSkillResults = await client.emit('get-skill', {
			payload: { id: skill.id },
		})

		const { skill: getSkill } = eventResponseUtil.getFirstResponseOrThrow(
			getSkillResults
		)

		assert.isEqual(skill.id, getSkill.id)
	}
}
