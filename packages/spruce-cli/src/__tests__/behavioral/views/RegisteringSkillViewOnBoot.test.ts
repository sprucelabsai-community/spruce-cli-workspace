import { test, assert } from '@sprucelabs/test-utils'
import ViewStore from '../../../features/view/stores/ViewStore'
import LintService from '../../../services/LintService'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import { DEMO_NUMBER_VIEWS_ON_BOOT } from '../../../tests/constants'

export default class RegisteringSkillViewOnBootTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'
    private static views: ViewStore

    protected static async beforeEach() {
        await super.beforeEach()
        LintService.enableLinting()
        this.views = this.Store('view')
    }

    @test()
    protected static async noEventsToStart() {
        await this.registerAndBootSkill()

        let views: any
        try {
            views = await this.fetchSkillViews()
        } catch {}

        assert.isFalsy(views)
    }

    @test()
    protected static async syncsViewsOnBoot() {
        await this.Action('view', 'create').execute({
            viewType: 'skillView',
            isRoot: true,
        })

        LintService.enableLinting()

        const buildResults = await this.buildSkill()

        this.log('build buildResults', JSON.stringify(buildResults))

        const results = await this.bootSkill()

        assert.isFalsy(results.errors)

        const skillViews = await this.fetchSkillViews()

        assert.isTruthy(skillViews, 'Skill views were not registered on boot!')
    }

    private static async fetchSkillViews() {
        return await this.views.fetchSkillViews()
    }

    protected static async registerAndBootSkill() {
        await this.registerCurrentSkillAndInstallToOrg()
        await this.buildSkill()

        const results = await this.bootSkill()
        assert.isFalsy(results.errors)
    }

    private static async bootSkill() {
        const boot = await this.Action('skill', 'boot').execute({})
        boot.meta?.kill()
        return boot
    }

    private static async buildSkill() {
        return await this.Service('build').build()
    }

    protected static async registerCurrentSkillAndInstallToOrg() {
        await this.people.loginAsDemoPerson(DEMO_NUMBER_VIEWS_ON_BOOT)
        const skillFixture = this.getSkillFixture()
        const orgFixture = this.getOrganizationFixture()

        const org = await orgFixture.seedDemoOrg({ name: 'my org' })

        const skill = await skillFixture.registerCurrentSkill({
            name: 'current skill',
        })

        await orgFixture.installSkillAtOrganization(skill.id, org.id)

        return { skillFixture, currentSkill: skill, org, orgFixture }
    }
}
