import AbstractCliTest from './AbstractCliTest'

export default abstract class AbstractEventTest extends AbstractCliTest {
	protected static async installEventFeature(cacheKey?: string) {
		const fixture = this.FeatureFixture()
		const cli = await fixture.installFeatures(
			[
				{
					code: 'skill',
					options: {
						name: 'testing events',
						description: 'this too, is a great test!',
					},
				},
				{
					code: 'event',
				},
			],
			cacheKey
		)

		return cli
	}

	protected static async seedDummySkillRegisterCurrentSkillAndInstallToOrg() {
		const cliPromise = this.installEventFeature('events')

		const skillFixture = this.SkillFixture()

		const skill2 = await skillFixture.seedDummySkill({
			name: 'my second skill',
		})

		debugger

		const orgFixture = this.OrganizationFixture()
		const org = await orgFixture.seedDummyOrg({ name: 'my org' })
		debugger
		await orgFixture.installSkillAtOrganization(skill2.id, org.id)

		const cli = await cliPromise
		debugger
		const skill = await skillFixture.registerCurrentSkill({
			name: 'my first skill',
		})
		debugger
		await orgFixture.installSkillAtOrganization(skill.id, org.id)

		return { skillFixture, currentSkill: skill, skill2, cli, org }
	}
}
