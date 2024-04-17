import { test, assert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../tests/AbstractSkillTest'

export default class ManagingDependenciesTest extends AbstractSkillTest {
    protected static skillCacheKey = 'skills'

    @test()
    protected static async hasAddDependencyAction() {
        assert.isFunction(this.Action('dependency', 'manage').execute)
    }

    @test()
    protected static async showsSkillsAsCheckboxes() {
        const skill1 = await this.getSkillFixture().seedDemoSkill({
            name: 'dependency manage 1',
        })

        const skill2 = await this.getSkillFixture().seedDemoSkill({
            name: 'dependency manage 2',
        })

        void this.Action('dependency', 'manage').execute({})

        await this.waitForInput()

        const last = this.ui.getLastInvocation()

        assert.isEqual(last.options.type, 'select')

        assert.doesInclude(last.options.options.choices, {
            value: skill1.id,
        })

        assert.doesInclude(last.options.options.choices, {
            value: skill2.id,
        })

        this.ui.reset()
    }

    @test()
    protected static async selectsExistingDependencies() {
        const skill1 = await this.getSkillFixture().seedDemoSkill({
            name: 'dependency manage 3',
        })

        this.Service('dependency').set([
            {
                namespace: skill1.slug,
                id: skill1.id,
            },
        ])

        void this.Action('dependency', 'manage').execute({})

        await this.waitForInput()

        const last = this.ui.getLastInvocation()

        assert.isEqualDeep(last.options.value, [skill1.id])

        this.ui.reset()
    }

    @test()
    protected static async canSelectANewDependencies() {
        const skill1 = await this.getSkillFixture().seedDemoSkill({
            name: 'dependency manage 4',
        })

        const skill2 = await this.getSkillFixture().seedDemoSkill({
            name: 'dependency manage 5',
        })

        const promise = this.Action('dependency', 'manage').execute({})

        await this.waitForInput()

        await this.ui.sendInput([skill1.id, skill2.id])

        const dependencies = this.Service('settings').get('dependencies')

        assert.isEqualDeep(dependencies, [
            {
                id: skill1.id,
                namespace: skill1.slug,
            },
            {
                id: skill2.id,
                namespace: skill2.slug,
            },
        ])

        await promise
    }

    @test()
    protected static async doesNotShowCurrentSkill() {
        const skill = await this.getSkillFixture().registerCurrentSkill({
            name: 'current skill in managing deps',
        })

        void this.Action('dependency', 'manage').execute({})

        await this.waitForInput()

        const last = this.ui.getLastInvocation()

        assert.doesNotInclude(last.options.options.choices, {
            value: skill.id,
        })

        this.ui.reset()
    }
}
