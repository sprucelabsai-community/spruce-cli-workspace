import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class OrganizationStoreTest extends AbstractCliTest {
	@test()
	protected static async canCreateStore() {
		assert.isTruthy(this.Store('organization'))
	}

	@test()
	protected static async skillIsNotInstalledByDefault() {
		await this.FeatureFixture().installCachedFeatures('organizations')

		const org = await this.getOrganizationFixture().seedDemoOrg({
			name: 'A cool org',
		})

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'a new skill',
		})

		const isInstalled = await this.Store('organization').isSkillInstalledAtOrg(
			skill.id,
			org.id
		)

		assert.isFalse(isInstalled)
	}

	@test()
	protected static async canDeleteOrg() {
		await this.FeatureFixture().installCachedFeatures('organizations')

		const org = await this.getOrganizationFixture().seedDemoOrg({
			name: 'A cool org',
		})

		const myOrgs = await this.Store('organization').fetchMyOrganizations()

		assert.doesInclude(myOrgs, org)

		await this.Store('organization').deleteOrganization(org.id)

		const myOrgs2 = await this.Store('organization').fetchMyOrganizations()

		assert.doesNotInclude(myOrgs2, org)
	}

	@test()
	protected static async installSkill() {
		await this.FeatureFixture().installCachedFeatures('organizations')

		const org = await this.getOrganizationFixture().seedDemoOrg({
			name: 'A cool org',
		})

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'a new skill',
		})

		await this.Store('organization').installSkillAtOrganization(
			skill.id,
			org.id
		)

		const isInstalled = await this.Store('organization').isSkillInstalledAtOrg(
			skill.id,
			org.id
		)
		assert.isTrue(isInstalled)
	}

	@test()
	protected static async canGetMyOrgs() {
		await this.FeatureFixture().installCachedFeatures('organizations')
		const orgFixture = this.getOrganizationFixture()
		const org1 = await orgFixture.seedDemoOrg({
			name: 'A cool org',
		})
		const org2 = await orgFixture.seedDemoOrg({
			name: 'A cool org',
		})

		const orgs = await this.Store('organization').fetchMyOrganizations()
		assert.isAbove(orgs.length, 1)
		assert.doesInclude(orgs, org1)
		assert.doesInclude(orgs, org2)
	}
}
