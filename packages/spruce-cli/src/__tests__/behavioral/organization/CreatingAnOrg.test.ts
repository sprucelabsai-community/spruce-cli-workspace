import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class CreatingAnOrgTest extends AbstractCliTest {
	@test()
	protected static async hasCreateAction() {
		await this.Cli()
		assert.isFunction(this.Action('organization', 'create').execute)
	}

	@test()
	protected static async createsAnOrg() {
		const slug = `my-org-${new Date().getTime()}`

		await this.FeatureFixture().installCachedFeatures('organizations')

		await this.people.loginAsDemoPerson()

		const results = await this.Action('organization', 'create').execute({
			nameReadable: 'My new org',
			nameKebab: slug,
		})

		assert.isFalsy(results.errors)

		const { organization } = results.meta ?? {}

		assert.isTruthy(organization)

		const client = await this.connectToApi()

		const orgResults = await client.emit('get-organization::v2020_12_25', {
			target: {
				organizationId: organization.id,
			},
		})

		const { organization: getOrganization } =
			eventResponseUtil.getFirstResponseOrThrow(orgResults)

		assert.isEqual(getOrganization.slug, slug)
	}
}
