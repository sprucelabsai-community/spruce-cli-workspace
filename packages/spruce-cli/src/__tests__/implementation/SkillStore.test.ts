import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
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
		errorAssert.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async cantLoadcurrentSkillIfNotInSkill() {
		const err = await assert.doesThrowAsync(() =>
			this.Store('skill').loadCurrentSkill()
		)
		errorAssert.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async cantCheckIfSkillIsRegisteredNotInSkill() {
		const err = await assert.doesThrowAsync(() =>
			this.Store('skill').isCurrentSkillRegistered()
		)
		errorAssert.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async canGetNamespace() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const namespace = await this.Store('skill').loadCurrentSkillsNamespace()
		assert.isEqual(namespace, 'TestSkill')
	}

	@test()
	protected static async canSetNamespace() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const store = this.Store('skill')
		let namespace = await store.loadCurrentSkillsNamespace()

		await this.Store('skill').setCurrentSkillsNamespace('new-namespace')

		namespace = await store.loadCurrentSkillsNamespace()
		assert.isEqual(namespace, 'NewNamespace')
	}

	@test()
	protected static async canRegister() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const slug = `awesome-skill-${new Date().getTime()}`
		await this.people.loginAsDemoPerson()

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
		const results = await client.authenticate({
			skillId: skill.id,
			apiKey: skill.apiKey,
		})

		assert.isEqual(results.skill?.id, skill.id)

		isRegistered = await skillStore.isCurrentSkillRegistered()
		assert.isTrue(isRegistered)

		const currentSkill = await skillStore.loadCurrentSkill()

		assert.isEqual(currentSkill.id, skill.id)
		assert.isTrue(currentSkill.isRegistered)
		assert.isEqual(currentSkill.name, 'awesome skill')
		assert.isEqual(currentSkill.slug, slug)
		assert.isEqual(currentSkill.apiKey, skill.apiKey)

		const env = this.Service('env')

		assert.isEqual(env.get('SKILL_ID'), skill.id)
		assert.isEqual(env.get('SKILL_API_KEY'), skill.apiKey)

		const err = await assert.doesThrowAsync(() =>
			skillStore.setCurrentSkillsNamespace('test')
		)

		errorAssert.assertError(err, 'GENERIC')

		const pkg = this.Service('pkg')
		const namespace = pkg.get('skill.namespace')
		assert.isEqual(namespace, slug)
	}
}
