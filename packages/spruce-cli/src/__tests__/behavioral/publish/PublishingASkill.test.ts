import { assert, errorAssert, test } from '@sprucelabs/test-utils'
import PublishAction, {
    PublishActionOptions,
} from '../../../features/skill/actions/PublishAction'
import { SkillStore } from '../../../features/skill/stores/SkillStore'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class PublishingASkillTest extends AbstractSkillTest {
    protected static skillCacheKey = 'skills'
    private static action: PublishAction
    private static skills: SkillStore

    protected static async beforeEach() {
        await super.beforeEach()
        this.action = this.Action('skill', 'publish')
        this.skills = this.Store('skill')
        await this.login()
    }

    @test()
    protected static async requiresRegistrationBeforePublishing() {
        const results = await this.execute()
        assert.isTruthy(results.errors, 'Expected errors but got none.')
        errorAssert.assertError(results.errors[0], 'NO_SKILLS_REGISTERED')
    }

    @test()
    protected static async publishesSkillIfRegistered() {
        await this.register()
        await this.executeAndAssertNoErrors()

        const skill = await this.loadCurrentSkill()
        assert.isTrue(skill.isPublished, 'Expected skill to be published.')
        assert.isTrue(skill.canBeInstalled, 'Expected skill to be installable.')
    }

    @test()
    protected static async canSetToInstallable() {
        await this.skills.unregisterSkill()
        await this.register()
        await this.executeAndAssertNoErrors({ isInstallable: false })
        const skill = await this.loadCurrentSkill()
        assert.isTrue(skill.isPublished, 'Expected skill to be published.')
        assert.isFalse(
            skill.canBeInstalled,
            'Expected skill to not be installable.'
        )
    }

    private static async loadCurrentSkill() {
        return await this.Store('skill').loadCurrentSkill()
    }

    private static async register() {
        const slug = `my-new-skill-${new Date().getTime()}`
        await this.skills.register({
            name: 'Publish skill test',
            slug,
        })
    }

    private static async executeAndAssertNoErrors(
        options?: PublishActionOptions
    ) {
        const results = await this.execute(options)
        assert.isFalsy(results.errors, 'Expected no errors but got some.')
    }

    private static async login() {
        await this.people.loginAsDemoPerson('720-253-5250')
    }

    private static async execute(options?: PublishActionOptions) {
        return await this.action.execute(options)
    }
}
