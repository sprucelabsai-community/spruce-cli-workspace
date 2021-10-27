import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../tests/AbstractSkillTest'

export default class ConfiguringDependenciesTest extends AbstractSkillTest {
	protected static skillCacheKey = 'skills'

	@test()
	protected static async hasAddDependencyAction() {
		assert.isFunction(this.Action('dependency', 'add').execute)
	}

	@test()
	protected static async errorsWhenPassedBadSlug() {
		await this.getSkillFixture().registerCurrentSkill({
			name: 'current skill in adding deps',
		})

		const results = await this.Action('dependency', 'add').execute({
			namespace: 'waka-waka',
		})

		assert.isTruthy(results.errors)

		errorAssertUtil.assertError(results.errors[0], 'SKILL_NOT_FOUND')
	}

	@test()
	protected static async succeedsWhenPassedGoodSlug() {
		const otherSkill = await this.getSkillFixture().seedDemoSkill({
			name: 'dependent skill',
		})

		const results = await this.Action('dependency', 'add').execute({
			namespace: otherSkill.slug,
		})

		assert.isFalsy(results.errors)

		const settings = this.Service('settings')
		const dependencies = settings.get('dependencies')

		assert.isEqualDeep(dependencies, [
			{
				id: otherSkill.id,
				namespace: otherSkill.slug,
			},
		])
	}

	@test()
	protected static async asksToSelectSkillWhenNoSlugPassed() {
		const otherSkill = await this.getSkillFixture().seedDemoSkill({
			name: 'dependent skill',
		})

		const promise = this.Action('dependency', 'add').execute({})

		await this.waitForInput()

		const last = this.ui.lastInvocation()

		assert.doesInclude(last.options.options.choices, {
			value: otherSkill.slug,
			label: otherSkill.name,
		})

		await this.ui.sendInput(otherSkill.slug)

		const results = await promise
		assert.isFalsy(results.errors)

		const settings = this.Service('settings')
		const dependencies = settings.get('dependencies')

		assert.isEqualDeep(dependencies[1], {
			id: otherSkill.id,
			namespace: otherSkill.slug,
		})
	}

	@test()
	protected static async canAddSkillThatWasCreatedBySomeoneElse() {
		const skill = await this.getSkillFixture().seedDemoSkill({
			name: 'global dependency skill',
		})

		await this.getPersonFixture().loginAsDemoPerson(
			process.env.DEMO_NUMBER_GLOBAL_EVENTS
		)

		const results = await this.Action('dependency', 'add').execute({
			namespace: skill.slug,
		})

		assert.isFalsy(results.errors)
	}
}
