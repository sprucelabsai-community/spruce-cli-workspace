import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import SkillStore from '../../features/skill/stores/SkillStore'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class SkillStoreTest extends AbstractCliTest {
	private static store: SkillStore

	protected static async beforeEach() {
		await super.beforeEach()
		this.store = this.SkillStore()
	}

	@test()
	protected static async throwsWhenMissingRequired() {
		//@ts-ignore
		const err = assert.doesThrow(() => this.Store('skill', {}))
		errorAssert.assertError(err, 'MISSING_PARAMETERS', {
			parameters: ['featureInstaller'],
		})
	}

	@test()
	protected static async hasRegisterMethod() {
		assert.isFunction(this.store.register)
	}

	@test()
	protected static async cantRegisterIfNotInSkill() {
		const err = await assert.doesThrowAsync(() =>
			this.store.register({
				name: 'awesome skill',
				slug: 'awesome-skill',
			})
		)
		errorAssert.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async cantLoadcurrentSkillIfNotInSkill() {
		const err = await assert.doesThrowAsync(() => this.store.loadCurrentSkill())
		errorAssert.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async cantCheckIfSkillIsRegisteredNotInSkill() {
		const err = await assert.doesThrowAsync(() =>
			this.store.isCurrentSkillRegistered()
		)
		errorAssert.assertError(err, 'DIRECTORY_NOT_SKILL')
	}

	@test()
	protected static async canGetNamespace() {
		await this.FeatureFixture().installCachedFeatures('skills')
		const namespace = await this.store.loadCurrentSkillsNamespace()
		assert.isEqual(namespace, 'TestSkill')
	}

	@test()
	protected static async canSetNamespace() {
		await this.FeatureFixture().installCachedFeatures('skills')

		let namespace = await this.store.loadCurrentSkillsNamespace()
		await this.store.setCurrentSkillsNamespace('new-namespace')
		namespace = await this.store.loadCurrentSkillsNamespace()
		assert.isEqual(namespace, 'NewNamespace')
	}

	@test()
	protected static async canRegister() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const slug = `awesome-skill-${new Date().getTime()}`
		await this.people.loginAsDemoPerson()

		let isRegistered = await this.store.isCurrentSkillRegistered()
		assert.isFalse(isRegistered)

		const skill = await this.store.register({
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

		isRegistered = await this.store.isCurrentSkillRegistered()
		assert.isTrue(isRegistered)

		const currentSkill = await this.store.loadCurrentSkill()

		assert.isEqual(currentSkill.id, skill.id)
		assert.isTrue(currentSkill.isRegistered)
		assert.isEqual(currentSkill.name, 'awesome skill')
		assert.isEqual(currentSkill.slug, slug)
		assert.isEqual(currentSkill.apiKey, skill.apiKey)

		const env = this.Service('env')

		assert.isEqual(env.get('SKILL_ID'), skill.id)
		assert.isEqual(env.get('SKILL_API_KEY'), skill.apiKey)

		const err = await assert.doesThrowAsync(() =>
			this.store.setCurrentSkillsNamespace('test')
		)

		errorAssert.assertError(err, 'GENERIC')

		const pkg = this.Service('pkg')
		const namespace = pkg.get('skill.namespace')
		assert.isEqual(namespace, slug)
	}

	private static SkillStore(): SkillStore {
		return this.Store('skill', {})
	}
}
