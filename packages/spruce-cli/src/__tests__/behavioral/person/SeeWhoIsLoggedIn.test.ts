import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class SeeWhoIsLoggedInTest extends AbstractCliTest {
	@test()
	protected static async hasWhoAmIAction() {
		await this.Cli()
		assert.isFunction(this.Action('person', 'whoami').execute)
	}

	@test()
	protected static async noOneIsLoggedInToStart() {
		await this.FeatureFixture().installCachedFeatures('skills')

		const results = await this.Action('person', 'whoami').execute({})

		assert.isFalsy(results.errors)
		assert.doesInclude(results.summaryLines, 'not logged in')
	}

	@test()
	protected static async canSeeWhoIsLoggedIn() {
		await this.FeatureFixture().installCachedFeatures('skills')
		await this.people.loginAsDemoPerson()

		const results = await this.Action('person', 'whoami').execute({})

		assert.isFalsy(results.errors)
		assert.doesInclude(results.summaryLines, 'logged in as')
	}
}
