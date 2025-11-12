import {
    MercuryClientFactory,
    MercuryTestClient,
} from '@sprucelabs/mercury-client'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import { FeatureActionResponse } from '../../../features/features.types'
import UnregisterSkillAction from '../../../features/global/actions/UnregisterSkillAction'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import {
    ListSkill,
    ListSkillsTargetAndPayload,
    UnregisterSkillTargetAndPayload,
} from '../../support/EventFaker'

export default class UnregisteringASkillTest extends AbstractCliTest {
    private static action: UnregisterSkillAction
    private static lastListSkillsPayload: ListSkillsTargetAndPayload['payload']
    private static fakedSkills: ListSkill[] = []
    private static executePromise: Promise<FeatureActionResponse>
    private static lastUnregisterSkillTarget: UnregisterSkillTargetAndPayload['target']

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()
        MercuryClientFactory.setIsTestMode(true)
        MercuryTestClient.setShouldRequireLocalListeners(true)
        this.action = this.Action('global', 'unregisterSkill')

        delete this.lastListSkillsPayload
        this.fakedSkills = []

        await this.eventFaker.fakeListSkills(({ payload }) => {
            this.lastListSkillsPayload = payload
            return this.fakedSkills
        })

        await this.eventFaker.fakeUnregisterSkill(({ target }) => {
            this.lastUnregisterSkillTarget = target
        })
    }

    @test()
    protected static async hasAction() {
        assert.isFunction(this.action.execute, 'Action not found')
    }

    @test()
    protected static async firstThingListsSkills() {
        await this.execute()
        await this.waitUntilFinished()

        assert.isEqualDeep(this.lastListSkillsPayload, {
            shouldOnlyShowMine: true,
        })
    }

    @test()
    protected static async presentsAnOptionForOnlySkillReturned() {
        this.pushFakedSkill()

        await this.executeAndWaitForInput()
        this.assertProptsForAllSkills()
        await this.selectSkill(0)
    }

    @test()
    protected static async presentsOptionsForMultipleSkills() {
        this.pushFakedSkill()
        this.pushFakedSkill()
        this.pushFakedSkill()

        await this.executeAndWaitForInput()
        this.assertProptsForAllSkills()

        await this.selectSkill(1)
    }

    @test('can unregister first skill', 0)
    @test('can unregister second skill', 1)
    protected static async passesSelectedSkillToUnregister(idx: number) {
        this.pushFakedSkill()
        this.pushFakedSkill()
        await this.executeAndWaitForInput()
        await this.selectSkill(idx)
        await this.waitUntilFinished()

        assert.isEqualDeep(
            this.lastUnregisterSkillTarget,
            {
                skillId: this.fakedSkills[idx].id,
            },
            'Skill ID not passed to unregister skill'
        )
    }

    private static async executeAndWaitForInput() {
        await this.execute()
        await this.waitForInput()
    }

    private static async selectSkill(idx: number) {
        await this.ui.sendInput(this.fakedSkills[idx].id)
    }

    private static assertProptsForAllSkills() {
        const prompt = this.ui.getLastInvocation()
        assert.isEqualDeep(prompt.options, {
            type: 'select',
            isRequired: true,
            options: {
                choices: this.generateExpectedSkillChoices(),
            },
        })
    }

    private static generateExpectedSkillChoices() {
        return this.fakedSkills.map((skill) => ({
            value: skill.id,
            label: `${skill.slug}: ${skill.name}`,
        }))
    }

    private static pushFakedSkill() {
        this.fakedSkills.push({
            id: generateId(),
            dateCreated: Date.now(),
            slug: generateId(),
            name: generateId(),
        })
    }

    private static async waitUntilFinished() {
        await this.executePromise
    }

    private static async execute() {
        this.executePromise = this.action.execute()
    }
}
