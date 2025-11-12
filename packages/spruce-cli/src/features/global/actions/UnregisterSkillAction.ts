import { buildSchema } from '@sprucelabs/schema'
import { ListSkill } from '../../../__tests__/support/EventFaker'
import SpruceError from '../../../errors/SpruceError'
import AbstractAction from '../../AbstractAction'
import { ActionOptions, FeatureActionResponse } from '../../features.types'
import { SkillStore } from '../../skill/stores/SkillStore'

const optionsSchema = buildSchema({
    id: 'unregisterSkill',
    description: 'Unregister a skill from your account.',
    fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class UnregisterSkillAction extends AbstractAction<OptionsSchema> {
    public optionsSchema: OptionsSchema = optionsSchema
    public commandAliases = ['unregister.skill']
    public invocationMessage = 'Unregistering skill... 🔧'
    private skills: SkillStore

    public constructor(options: ActionOptions) {
        super(options)
        this.skills = this.Store('skill')
    }

    public async execute(): Promise<FeatureActionResponse> {
        const response: FeatureActionResponse = {}

        const skills = await this.skills.fetchMySkills()
        if (skills.length > 0) {
            const skillId = await this.ui.prompt({
                type: 'select',
                isRequired: true,
                options: {
                    choices: skills.map((skill) => this.skillToChoices(skill)),
                },
            })
            await this.skills.unregisterSkill(skillId)
            const match = skills.find((s) => s.id === skillId)
            response.summaryLines = [`Unregistered ${match?.name}`]
        } else {
            response.errors = [
                new SpruceError({ code: 'NO_SKILLS_REGISTERED' }),
            ]
        }

        return response
    }

    private skillToChoices(skill: ListSkill): { value: string; label: string } {
        return {
            value: skill.id,
            label: `${skill.slug}: ${skill.name}`,
        }
    }
}
