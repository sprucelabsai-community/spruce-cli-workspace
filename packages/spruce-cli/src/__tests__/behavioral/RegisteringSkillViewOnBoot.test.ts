import { test, assert } from '@sprucelabs/test'
import AbstractSkillTest from '../../tests/AbstractSkillTest'

export default class RegisteringSkillViewOnBootTest extends AbstractSkillTest {
	protected static skillCacheKey = 'views'

	@test()
	protected static async noEventsToStart() {
		await this.registerAndBootSkill()

		const skillViews = await this.Store('view').fetchSkillViews()

		assert.isFalsy(skillViews)
	}

	@test()
	protected static async syncsViewsOnBoot() {
		await this.Action('view', 'create').execute({
			viewType: 'skillView',
			isRoot: true,
		})

		await this.buildSkill()

		const results = await this.bootSkill()

		assert.isFalsy(results.errors)

		const skillViews = await this.Store('view').fetchSkillViews()

		assert.isTruthy(skillViews, 'Skill views were not registered on boot!')
	}

	protected static async registerAndBootSkill() {
		await this.registerCurrentSkillAndInstallToOrg()
		await this.buildSkill()

		const results = await this.bootSkill()
		assert.isFalsy(results.errors)
	}

	private static async bootSkill() {
		const boot = await this.Action('skill', 'boot').execute({})
		boot.meta?.kill()
		return boot
	}

	private static async buildSkill() {
		await this.Service('build').build()
	}

	protected static async registerCurrentSkillAndInstallToOrg() {
		await this.people.loginAsDemoPerson(process.env.DEMO_NUMBER_VIEWS_ON_BOOT)
		const skillFixture = this.getSkillFixture()
		const orgFixture = this.getOrganizationFixture()

		const org = await orgFixture.seedDemoOrg({ name: 'my org' })

		const skill = await skillFixture.registerCurrentSkill({
			name: 'current skill',
		})

		await orgFixture.installSkillAtOrganization(skill.id, org.id)

		return { skillFixture, currentSkill: skill, org, orgFixture }
	}
}
