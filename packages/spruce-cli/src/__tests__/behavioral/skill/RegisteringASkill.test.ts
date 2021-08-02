import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class RegisteringASkillTest extends AbstractCliTest {
	@test()
	protected static async hasRegisterAction() {
		assert.isFunction(this.Action('skill', 'register').execute)
	}

	@test()
	protected static async cantRegisterWithoutBeingLoggedIn() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const results = await this.Action('skill', 'register').execute({
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
		await this.FeatureFixture().installCachedFeatures('skills')
		await this.getPersonFixture().loginAsDemoPerson()

		const slug = `my-new-skill-${new Date().getTime()}`
		const results = await this.Action('skill', 'register').execute({
			nameReadable: 'my new skill',
			nameKebab: slug,
		})

		assert.isFalsy(results.errors)
		const skill = results.meta?.skill
		assert.isTruthy(skill)

		const client = await this.connectToApi()
		const getSkillResults = await client.emit('get-skill::v2020_12_25', {
			target: { skillId: skill.id },
		})

		const { skill: getSkill } =
			eventResponseUtil.getFirstResponseOrThrow(getSkillResults)

		assert.isEqual(skill.id, getSkill.id)

		const auth = this.Service('auth')
		const currentSkill = auth.getCurrentSkill()

		assert.isTruthy(currentSkill)
		assert.isEqual(currentSkill.name, 'my new skill')
		assert.isEqual(currentSkill.slug, slug)
	}
}
