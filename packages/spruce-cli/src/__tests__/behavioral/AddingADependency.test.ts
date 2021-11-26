import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../tests/AbstractSkillTest'

export default class ConfiguringDependenciesTest extends AbstractSkillTest {
	protected static skillCacheKey = 'skills'
	private static parentSkill: {
		id: string
		slug: string
		name: string
	}

	@test()
	protected static async hasAddDependencyAction() {
		assert.isFunction(this.Action('dependency', 'add').execute)
	}

	@test()
	protected static async errorsWhenPassedBadNamespace() {
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
	protected static async succeedsWhenPassedGoodNamespace() {
		const parentSkill = await this.getSkillFixture().seedDemoSkill({
			name: 'dependent skill',
		})

		const results = await this.Action('dependency', 'add').execute({
			namespace: parentSkill.slug,
		})

		assert.isFalsy(results.errors)

		this.parentSkill = parentSkill

		const settings = this.Service('settings')
		const dependencies = settings.get('dependencies')

		assert.isEqualDeep(dependencies, [
			{
				id: parentSkill.id,
				namespace: parentSkill.slug,
			},
		])
	}

	@test()
	protected static async cantAddDependencyTwice() {
		const err = assert.doesThrow(() =>
			this.Service('dependency').add({
				id: this.parentSkill.id,
				namespace: this.parentSkill.slug,
			})
		)

		errorAssertUtil.assertError(err, 'DEPENDENCY_EXISTS')
	}

	@test()
	protected static async asksToSelectSkillWhenNoNamespacePassed() {
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
	protected static async doesNotShowSkillsThatAreAlreadySetAsADependency() {
		await this.getPersonFixture().loginAsDemoPerson()

		void this.Action('dependency', 'add').execute({})

		await this.waitForInput()

		const last = this.ui.lastInvocation()

		this.ui.reset()

		assert.doesNotInclude(last.options.options.choices, {
			value: this.parentSkill.slug,
			label: this.parentSkill.name,
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
