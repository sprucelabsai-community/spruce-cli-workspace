import { diskUtil, HASH_SPRUCE_DIR } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AuthService from '../../services/AuthService'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class AuthServiceTest extends AbstractCliTest {
	private static auth: AuthService
	protected static async beforeEach() {
		await super.beforeEach()
		diskUtil.createDir(this.resolvePath(HASH_SPRUCE_DIR))
		this.auth = this.Service('auth')
	}

	@test()
	protected static async canInstantiatePersonStore() {
		assert.isTruthy(this.auth)
	}

	@test()
	protected static async hasLoggedInPersonMethod() {
		assert.isFunction(this.auth.getLoggedInPerson)
	}

	@test()
	protected static async loggedInPersonIsNullWhenNotLoggedIn() {
		assert.isNull(this.auth.getLoggedInPerson())
	}

	@test()
	protected static async cantSaveBadLoggedInPerson() {
		const err = assert.doesThrow(() =>
			//@ts-ignore
			this.auth.setLoggedInPerson({ test: true })
		)

		errorAssertUtil.assertError(err, 'MISSING_PARAMETERS')
	}

	@test()
	protected static canSaveLoggedInPerson() {
		const auth = this.auth
		const person = {
			id: 'test',
			casualName: 'friend',
			token: 'token',
		}

		auth.setLoggedInPerson(person)

		const loggedIn = auth.getLoggedInPerson()

		assert.isEqualDeep(loggedIn, { ...person, isLoggedIn: true })
	}

	@test()
	protected static canLogOut() {
		const auth = this.auth
		const person = {
			id: 'test',
			casualName: 'friend',
			token: 'token',
		}

		auth.setLoggedInPerson(person)
		auth.logOutPerson()

		assert.isNull(auth.getLoggedInPerson())
	}

	@test()
	protected static getCurrentSkillReturnsNull() {
		this.writePackageJson()
		assert.isNull(this.auth.getCurrentSkill())
	}

	@test()
	protected static canSetCurrentSkill() {
		this.writePackageJson()
		const skill = {
			id: '123467aaoeuaoeu',
			apiKey: 'taco',
			name: 'go team',
			slug: 'taco-bravo',
		}

		this.auth.updateCurrentSkill(skill)

		assert.isEqualDeep(this.auth.getCurrentSkill(), skill)
	}

	private static writePackageJson() {
		diskUtil.writeFile(this.resolvePath('package.json'), '{}')
	}
}
