import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'
import testUtil from '../../tests/utilities/test.utility'
import { ApiClient } from '../../types/apiClient.types'

export default class DeployingToSandboxTest extends AbstractCliTest {
	private static sandboxDemoNumber = process.env.SANDBOX_DEMO_NUMBER as string

	protected static async beforeAll() {
		await super.beforeAll()
		if (!this.sandboxDemoNumber) {
			assert.fail(
				'You gotta have a SANDBOX_DEMO_NUMBER set in your ENV for the Deploying to Sandbox test pass.'
			)
		}
	}

	protected static async beforeEach() {
		await super.beforeEach()

		const personFixture = this.people
		await personFixture.loginAsDemoPerson(this.sandboxDemoNumber)
	}

	protected static async afterEach() {
		await this.getSkillFixture().clearAllSkills()
		await super.afterEach()
	}

	@test()
	protected static async hasSetupSandboxAction() {
		assert.isFunction(this.Action('sandbox', 'setup').execute)
	}

	@test()
	protected static async writesWillBootListener() {
		await this.FeatureFixture().installCachedFeatures('sandbox')
		const results = await this.Action('sandbox', 'setup').execute({})

		assert.isFalsy(results.errors)
		const version = versionUtil.generateVersion().dirValue
		testUtil.assertFileByNameInGeneratedFiles(
			`will-boot.${version}.listener.ts`,
			results.files
		)
	}

	@test()
	protected static async throwsHelpfulErrorWhenMissingParams() {
		await this.installAndSetupForSandbox()

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'My new skill',
		})

		await this.resetCurrentSkill()

		const env = this.Service('env')

		env.set('SKILL_ID', skill.id)
		env.unset('SKILL_NAME')
		env.unset('SKILL_SLUG')

		const results = await this.Action('skill', 'boot').execute({ local: true })

		assert.isTruthy(results.errors)

		errorAssert.assertError(results.errors[0], 'MISSING_PARAMETERS', {
			parameters: ['env.SKILL_NAME', 'env.SKILL_SLUG'],
		})
	}

	@test()
	protected static async doesNotTryToRegisterIfNeverRegisteredBefore() {
		const { client } = await this.installAndSetupForSandbox()

		const expected = await this.getTotalSkills(client)

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		boot.meta?.kill()

		const actual = await this.getTotalSkills(client)

		assert.isEqual(expected, actual)
	}

	@test()
	protected static async skipsAlreadyRegisteredSkill() {
		const { client } = await this.installAndSetupForSandbox()

		const registered = await this.getSkillFixture().registerCurrentSkill({
			name: 'My new skill',
		})

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		boot.meta?.kill()

		const skills = await this.fetchSkills(client)

		assert.isLength(skills, 1)
		assert.isTruthy(skills[0])
		assert.isEqual(skills[0].id, registered.id)
	}

	@test()
	protected static async registersSkillAgain() {
		const { client } = await this.installAndSetupForSandbox()

		const skill = await this.getSkillFixture().registerCurrentSkill({
			name: 'My new skill',
		})

		await this.resetCurrentSkill()

		const env = this.Service('env')
		env.set('SKILL_ID', skill.id)
		env.set('SKILL_NAME', skill.name)
		env.set('SKILL_SLUG', skill.slug)

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		boot.meta?.kill()

		const skills = await this.fetchSkills(client)

		assert.isLength(skills, 1)
		assert.isTruthy(skills[0])
		assert.isEqual(skills[0].slug, skill.slug)
		assert.isNotEqual(skills[0].id, skill.id)
	}

	@test()
	protected static async registersSkillAndCanBootAgain() {
		await this.installAndSetupForSandbox()

		await this.getSkillFixture().registerCurrentSkill({
			name: 'My new skill',
		})

		await this.resetCurrentSkill()

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		boot.meta?.kill()

		const boot2 = await this.Action('skill', 'boot').execute({ local: true })

		boot2.meta?.kill()
	}

	@test()
	protected static async canReRegisterAndThenRegisterConversationsWithoutCrash() {
		await this.installAndSetupForSandbox('conversation-with-sandbox')

		await this.getSkillFixture().registerCurrentSkill({
			name: 'Conversation test',
		})

		await this.resetCurrentSkill()

		await this.Action('conversation', 'create').execute({
			nameReadable: 'book an appointment',
			nameCamel: 'bookAnAppointment',
		})

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		boot.meta?.kill()
	}

	private static async installAndSetupForSandbox(cacheKey = 'sandbox') {
		const client = await this.getMercuryFixture().connectToApi()

		const cli = await this.FeatureFixture().installCachedFeatures(cacheKey)

		await this.Action('sandbox', 'setup').execute({})

		const env = this.Service('env')
		env.set('SANDBOX_DEMO_NUMBER', this.sandboxDemoNumber)

		return { cli, client }
	}

	private static async fetchSkills(client: ApiClient) {
		const results = await client.emit(`list-skills::v2020_12_25`, {
			payload: {
				shouldOnlyShowMine: true,
			},
		})

		const { skills } = eventResponseUtil.getFirstResponseOrThrow(results)

		return skills
	}

	private static async resetCurrentSkill() {
		const isInstalled = this.Service('settings').isMarkedAsInstalled('skill')
		if (!isInstalled) {
			return
		}

		const skills = this.Store('skill')
		const isRegistered = await skills.isCurrentSkillRegistered()

		if (isRegistered) {
			const skill = await skills.loadCurrentSkill()

			if (skill.id) {
				await skills.unregisterSkill(skill.id)
			}
		}
	}

	private static async getTotalSkills(client: ApiClient) {
		const results2 = await client.emit(`list-skills::v2020_12_25`, {
			payload: { shouldOnlyShowMine: true },
		})

		const { skills: skills2 } =
			eventResponseUtil.getFirstResponseOrThrow(results2)

		const total = skills2.length
		return total
	}
}
