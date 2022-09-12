import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class SettingUpViewsTest extends AbstractCliTest {
	@test()
	protected static async canGetViewFeature() {
		const cli = await this.Cli()
		const feature = cli.getFeature('view')
		assert.isTruthy(feature)
	}

	@test()
	protected static async installingViewsAddsHeartwoodAsDependency() {
		await this.FeatureFixture().installFeatures([
			{
				code: 'skill',
				options: {
					name: 'testing views',
					description: 'this too, is a great test!',
				},
			},
			{
				code: 'view',
			},
		])

		await this.people.loginAsDemoPerson()

		const dependencies = this.Service('dependency').get()
		assert.isLength(dependencies, 1)

		assert.isEqual(dependencies[0].namespace, 'heartwood')
	}
}
