import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
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

		const personFixture = this.getPersonFixture()
		await personFixture.loginAsDemoPerson(this.sandboxDemoNumber)
	}

	protected static async afterEach() {
		await this.resetSkills()

		await super.afterEach()
	}

	private static async resetSkills() {
		const skillFixture = this.getSkillFixture()
		await skillFixture.clearAllSkills()
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

		await this.getSkillFixture().registerCurrentSkill({
			name: 'My new skill',
		})

		await this.resetSkills()

		const env = this.Service('env')

		env.unset('SKILL_NAME')
		env.unset('SKILL_SLUG')

		const results = await this.Action('skill', 'boot').execute({ local: true })

		assert.isTruthy(results.errors)

		errorAssertUtil.assertError(results.errors[0], 'MISSING_PARAMETERS', {
			parameters: ['env.SKILL_NAME', 'env.SKILL_SLUG'],
		})
	}

	@test()
	protected static async doesNotReRegisterIfNotRegisteredFirstTime() {
		const { client } = await this.installAndSetupForSandbox()

		const boot = await this.Action('skill', 'boot').execute({ local: true })

		boot.meta?.kill()

		const results2 = await client.emit(`list-skills::v2020_12_25`, {
			payload: { showMineOnly: true },
		})

		const { skills: skills2 } =
			eventResponseUtil.getFirstResponseOrThrow(results2)

		assert.isLength(skills2, 0)
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

		await this.resetSkills()

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

		await this.resetSkills()

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

		await this.resetSkills()

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
				showMineOnly: true,
			},
		})

		const { skills } = eventResponseUtil.getFirstResponseOrThrow(results)

		return skills
	}
}
