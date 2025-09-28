import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import testUtil from '../../../tests/utilities/test.utility'
import { ApiClient } from '../../../types/apiClient.types'
import { RegisteredSkill } from '../../../types/cli.types'

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

        await this.unregisterCurrentSkill()

        const env = this.Service('env')

        env.set('SKILL_ID', skill.id)
        env.unset('SKILL_NAME')
        env.unset('SKILL_SLUG')

        const results = await this.boot()

        assert.isTruthy(results.errors)

        errorAssert.assertError(results.errors[0], 'MISSING_PARAMETERS', {
            parameters: ['env.SKILL_NAME'],
        })
    }

    @test()
    protected static async doesNotTryToRegisterIfNeverRegisteredBefore() {
        const { client } = await this.installAndSetupForSandbox()

        const expected = await this.getTotalSkills(client)

        await assert.doesThrowAsync(
            () => this.bootAndKill(),
            "don't have access"
        )

        const actual = await this.getTotalSkills(client)
        assert.isEqual(expected, actual)
    }

    @test()
    protected static async skipsAlreadyRegisteredSkill() {
        const { client } = await this.installAndSetupForSandbox()

        const registered = await this.getSkillFixture().registerCurrentSkill({
            name: 'My new skill',
        })

        await this.bootAndKill()

        const skills = await this.fetchSkills(client)

        assert.isLength(skills, 1)
        assert.isTruthy(skills[0])
        assert.isEqual(skills[0].id, registered.id)
    }

    @test()
    protected static async registersSkillAgain() {
        const { client } = await this.installAndSetupForSandbox()

        const skill = await this.registerCurrentSkill('My new skill')

        await this.unregisterCurrentSkill()

        this.updateEnv(skill)

        await this.bootAndKill()

        const skills = await this.fetchSkills(client)

        assert.isLength(skills, 1)
        assert.isTruthy(skills[0])
        assert.isEqual(skills[0].slug, skill.slug)
        assert.isNotEqual(skills[0].id, skill.id)
    }

    @test()
    protected static async registersSkillAndCanBootAgain() {
        await this.installAndSetupForSandbox()
        const skill = await this.registerCurrentSkill('My new skill')
        await this.unregisterCurrentSkill()

        this.updateEnv(skill)

        await this.bootAndKill()
        await this.bootAndKill()
    }

    @test()
    protected static async canReRegisterAndThenRegisterConversationsWithoutCrash() {
        await this.installAndSetupForSandbox('conversation-with-sandbox')

        const skill = await this.registerCurrentSkill('Conversation test')
        await this.unregisterCurrentSkill()
        this.updateEnv(skill)

        await this.Action('conversation', 'create').execute({
            nameReadable: 'book an appointment',
            nameCamel: 'bookAnAppointment',
        })

        await this.bootAndKill()
    }

    @test()
    protected static async logsInSkillIfAlreadyRegisteredButMissingEnv() {
        await this.installAndSetupForSandbox()

        await this.registerCurrentSkill('Login if already registered')

        const env = this.Service('env')

        const originalSkillId = env.get('SKILL_ID')
        const orginalSkillApiKey = env.get('SKILL_API_KEY')

        env.set('SKILL_ID', 'this is garbage')

        await this.bootAndKill()

        delete process.env.SKILL_ID
        delete process.env.SKILL_API_KEY

        const skillId = env.get('SKILL_ID')
        const apiKey = env.get('SKILL_API_KEY')

        assert.isEqual(
            skillId,
            originalSkillId,
            'It logged in as the wrong skill!'
        )

        assert.isEqual(
            apiKey,
            orginalSkillApiKey,
            'It logged in with the wrong api key!'
        )
    }

    private static updateEnv(skill: RegisteredSkill) {
        const env = this.Service('env')
        env.set('SKILL_ID', skill.id)
        env.set('SKILL_NAME', skill.name)
    }

    private static async bootAndKill() {
        const boot = await this.boot()
        assert.isFalsy(boot.errors)
        boot.meta?.kill()
    }

    private static async boot() {
        return await this.Action('skill', 'boot').execute({ local: true })
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

    private static async registerCurrentSkill(name: string) {
        return await this.getSkillFixture().registerCurrentSkill({
            name,
        })
    }

    private static async unregisterCurrentSkill() {
        const isInstalled =
            this.Service('settings').isMarkedAsInstalled('skill')
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
