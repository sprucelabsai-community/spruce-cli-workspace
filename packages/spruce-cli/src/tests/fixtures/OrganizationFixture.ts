import StoreFactory from '../../stores/StoreFactory'
import PersonFixture from './PersonFixture'

export default class OrganizationFixture {
	private storeFactory: StoreFactory
	private personFixture: PersonFixture

	public constructor(personFixture: PersonFixture, storeFactory: StoreFactory) {
		this.storeFactory = storeFactory
		this.personFixture = personFixture
	}

	public async seedDemoOrg(options: { name: string; slug?: string }) {
		await this.personFixture.loginAsDemoPerson()

		return this.storeFactory.Store('organization').create({
			slug: `my-org-${new Date().getTime()}`,
			...options,
		})
	}

	public async clearAllOrgs() {
		await this.personFixture.loginAsDemoPerson()

		const orgStore = this.storeFactory.Store('organization')
		const orgs = await orgStore.fetchMyOrganizations()

		for (const org of orgs) {
			await orgStore.deleteOrganization(org.id)
		}

		return orgs.length
	}

	public async installSkillAtOrganization(skillId: string, orgId: string) {
		await this.personFixture.loginAsDemoPerson()
		const orgStore = this.storeFactory.Store('organization')

		await orgStore.installSkillAtOrganization(skillId, orgId)
	}
}
