import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { Organization } from '@sprucelabs/spruce-core-schemas'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import { CreateOrganizationTargetAndPayload } from '../../support/EventFaker'

export default class CreatingAnOrgTest extends AbstractCliTest {
    private static organization: Organization
    private static slug = generateId()
    private static nameReadable = generateId()
    private static lastCreateOrgTargetAndPayload: CreateOrganizationTargetAndPayload

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()

        MercuryClientFactory.setIsTestMode(true)

        this.organization = this.eventFaker.generateOrganizationValues()

        await this.eventFaker.fakeRequestPin()
        await this.eventFaker.fakeConfirmPin()
        await this.eventFaker.fakeCreateOrganization((targetAndPayload) => {
            this.lastCreateOrgTargetAndPayload = targetAndPayload
            return this.organization
        })
    }

    @test()
    protected static async hasCreateAction() {
        await this.Cli()
        assert.isFunction(this.Action('organization', 'create').execute)
    }

    @test()
    protected static async createsAnOrg() {
        await this.FeatureFixture().installCachedFeatures('organizations')
        await this.people.loginAsDemoPerson()

        const results = await this.Action('organization', 'create').execute({
            nameReadable: this.nameReadable,
            nameKebab: this.slug,
        })

        assert.isFalsy(results.errors)
        assert.isEqualDeep(this.lastCreateOrgTargetAndPayload.payload, {
            name: this.nameReadable,
            slug: this.slug,
        })
    }
}
