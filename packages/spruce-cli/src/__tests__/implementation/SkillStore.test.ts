import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class SkillStoreTest extends AbstractCliTest {
	@test()
	protected static async canInstantiateSkillStore() {
		assert.isTruthy(this.Store('skill'))
	}

	@test()
	protected static async hasRegisterMethod() {
		assert.isFunction(this.Store('skill').register)
	}

	@test()
	protected static async cantRegisterIfNotInSkill() {
		const err = await assert.doesThrowAsync(() =>
			this.Store('skill').register({
				name: 'awesome skill',
				slug: 'awesome-skill',
			})
		)
		errorAssertUtil.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async cantLoadcurrentSkillIfNotInSkill() {
		const err = await assert.doesThrowAsync(() =>
			this.Store('skill').loadCurrentSkill()
		)
		errorAssertUtil.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async cantCheckIfSkillIsRegisteredNotInSkill() {
		const err = await assert.doesThrowAsync(() =>
			this.Store('skill').isCurrentSkillRegistered()
		)
		errorAssertUtil.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async canRegister() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const slug = `awesome-skill-${new Date().getTime()}`
		await this.PersonFixture().loginAsDummyPerson()

		const skillStore = this.Store('skill')

		let isRegistered = await skillStore.isCurrentSkillRegistered()
		assert.isFalse(isRegistered)

		const skill = await skillStore.register({
			name: 'awesome skill',
			slug,
		})

		assert.isTruthy(skill)
		assert.isEqual(skill.name, 'awesome skill')
		assert.isEqual(skill.slug, slug)
		assert.isString(skill.apiKey)
		assert.isString(skill.id)

		const client = await this.connectToApi()
		const results = await client.emit('authenticate', {
			payload: {
				skillId: skill.id,
				apiKey: skill.apiKey,
			},
		})

		const response = eventResponseUtil.getFirstResponseOrThrow(results)
		assert.isEqual(response.auth.skill?.id, skill.id)

		isRegistered = await skillStore.isCurrentSkillRegistered()
		assert.isTrue(isRegistered)

		const currentSkill = await this.Store('skill').loadCurrentSkill()

		assert.isEqual(currentSkill.id, skill.id)
		assert.isTrue(currentSkill.isRegistered)
		assert.isEqual(currentSkill.name, 'awesome skill')
		assert.isEqual(currentSkill.slug, slug)
		assert.isEqual(currentSkill.apiKey, skill.apiKey)

		const env = this.Service('env')

		assert.isEqual(env.get('SKILL_ID'), skill.id)
		assert.isEqual(env.get('SKILL_API_KEY'), skill.apiKey)
	}
}
