import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import { DEMO_NUMBER_LOGIN_AS_SKILL } from '../../tests/constants'
import { RegisteredSkill } from '../../types/cli.types'

export default class LoggingInAsASkillTest extends AbstractSkillTest {
	protected static skillCacheKey = 'skills'
	private static skill1: RegisteredSkill
	private static skill2: RegisteredSkill
	private static skill3: RegisteredSkill

	protected static async beforeAll() {
		await super.beforeAll()

		await this.people.loginAsDemoPerson(DEMO_NUMBER_LOGIN_AS_SKILL)

		const skillFixture = this.getSkillFixture()
		await skillFixture.clearAllSkills()

		await this.people.logout()
	}

	@test()
	protected static async hasLoginAction() {
		assert.isFunction(this.Action('skill', 'login').execute)
	}

	@test()
	protected static async asksToLoginIfNotLoggedIn() {
		void this.Action('skill', 'login').execute({})

		await this.waitForInput()

		assert.doesInclude(this.ui.getLastInvocation().options.label, 'Phone')

		this.ui.reset()
	}

	@test()
	protected static async returnsErrorIfNoSkillHasEverBeenRegistered() {
		await this.login()

		const results = await this.Action('skill', 'login').execute({})

		assert.isTruthy(results.errors)
		assert.isLength(results.errors, 1)
		errorAssert.assertError(results.errors[0], 'NO_SKILLS_REGISTERED')
	}

	private static async login() {
		const person = await this.people.loginAsDemoPerson(
			DEMO_NUMBER_LOGIN_AS_SKILL
		)

		this.Service('auth').setLoggedInPerson(person)
	}

	@test()
	protected static async logsInAsOnlySkillIfOnly1Registered() {
		await this.login()

		this.skill1 = await this.getSkillFixture().seedDemoSkill({
			name: `login skill ${new Date().getTime()}`,
		})

		const results = await this.Action('skill', 'login').execute({})

		assert.isFalsy(results.errors)

		const loggedIn = this.Service('auth').getCurrentSkill()
		assert.isEqual(loggedIn?.id, this.skill1.id)
	}

	@test()
	protected static async letsYouSelectSkillIfMoreThan1IsRegistered() {
		await this.login()

		this.skill2 = await this.getSkillFixture().seedDemoSkill({
			name: `login skill 2 ${new Date().getTime()}`,
		})

		const promise = this.Action('skill', 'login').execute({})

		await this.waitForInput()

		assert.doesInclude(this.ui.getLastInvocation().command, 'prompt')
		assert.doesInclude(this.ui.getLastInvocation().options.type, 'select')
		assert.isEqualDeep(
			this.ui.getLastInvocation().options.options.choices,
			[this.skill1, this.skill2].map((s) => ({
				label: s.name,
				value: s.id,
			}))
		)

		await this.ui.sendInput(this.skill2.id)

		await promise

		const loggedIn = this.Service('auth').getCurrentSkill()
		assert.isEqual(loggedIn?.id, this.skill2.id)
	}

	@test()
	protected static async cantLoginWithSlugYouDontOwn() {
		await this.login()
		const results = await this.Action('skill', 'login').execute({
			skillSlug: 'never found',
		})

		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'SKILL_NOT_FOUND')
	}

	@test()
	protected static async canLoginWithSlugYouOwn() {
		await this.login()

		this.skill3 = await this.getSkillFixture().seedDemoSkill({
			name: `login skill 3 ${new Date().getTime()}`,
		})

		const results = await this.Action('skill', 'login').execute({
			skillSlug: this.skill3.slug,
		})

		assert.isFalsy(results.errors)

		const loggedIn = this.Service('auth').getCurrentSkill()
		assert.isEqual(loggedIn?.id, this.skill3.id)
	}
}
