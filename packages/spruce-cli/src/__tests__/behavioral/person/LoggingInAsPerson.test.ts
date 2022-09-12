import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import { DEMO_NUMBER } from '../../../tests/fixtures/PersonFixture'

export default class LoggingInAsPersonTest extends AbstractCliTest {
	@test()
	protected static async hasLoginAction() {
		await this.Cli()
		assert.isFunction(this.Action('person', 'login').execute)
	}

	@test()
	protected static async asksForPinWithoutBeingInstalled() {
		await this.FeatureFixture().installCachedFeatures('skills')

		void this.Action('person', 'login').execute({
			phone: DEMO_NUMBER,
		})

		await this.waitForInput()

		assert.doesInclude(this.ui.invocations, {
			command: 'prompt',
			options: {
				type: 'text',
			},
		})

		this.ui.reset()
	}

	@test.skip('enable when there are demo numbers that throw with bad pin')
	protected static async badPinRendersWarningAndAsksForPinAgain() {
		await this.FeatureFixture().installCachedFeatures('skills')

		void this.Action('person', 'login').execute({
			phone: DEMO_NUMBER,
		})

		await this.waitForInput()

		await this.ui.sendInput('0000')

		await this.waitForInput()

		assert.doesInclude(this.ui.invocations, {
			command: 'renderWarning',
		})

		await this.waitForInput()

		assert.doesInclude(this.ui.invocations, {
			command: 'prompt',
			options: {
				type: 'text',
			},
		})

		this.ui.reset()
	}

	@test()
	protected static async canLoginAsDemoPerson() {
		await this.installSkillAndLoginAsDemoPerson()

		const person = this.Service('auth').getLoggedInPerson()

		assert.isTruthy(person)
		assert.isString(person.id)
		assert.isString(person.token)
		assert.isTrue(person.isLoggedIn)
	}

	@test()
	protected static async cantLogoutWithoutBeingLoggedIn() {
		await this.FeatureFixture().installCachedFeatures('skills')
		const results = await this.Action('person', 'logout').execute({})

		assert.isTruthy(results.errors)
		assert.isLength(results.errors, 1)

		errorAssert.assertError(results.errors[0], 'NOT_LOGGED_IN')
	}

	@test()
	protected static async canLogOut() {
		await this.installSkillAndLoginAsDemoPerson()

		const results = await this.Action('person', 'logout').execute({})

		assert.isFalsy(results.errors)

		const person = this.Service('auth').getLoggedInPerson()

		assert.isNull(person)
	}

	@test()
	protected static async canLogInWithExpiredPinWithouHavingToLogOutFirst() {
		await this.FeatureFixture().installCachedFeatures('skills')

		this.Service('auth').setLoggedInPerson({
			token: '234',
			id: 'test',
			casualName: 'casual test',
		})

		await this.loginAsPerson()
	}

	private static async installSkillAndLoginAsDemoPerson() {
		const cli = await this.FeatureFixture().installCachedFeatures('skills')

		await this.loginAsPerson()

		return cli
	}

	private static async loginAsPerson() {
		const promise = this.Action('person', 'login').execute({
			phone: DEMO_NUMBER,
		})

		await this.waitForInput()
		await this.ui.sendInput(DEMO_NUMBER.substr(-4))

		const results = await promise

		assert.isFalsy(results.errors)
	}
}
