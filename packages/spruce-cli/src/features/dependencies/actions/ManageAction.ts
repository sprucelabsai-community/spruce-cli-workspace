import { buildSchema } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'manageDependencies',
    description: 'Manage the skills you depend on.',
    fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class DeployAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public commandAliases = [
        'manage.dependencies',
        'remove.dependency',
        'dependencies',
    ]
    public invocationMessage = 'Managing dependencies... 🔗'

    public async execute(): Promise<FeatureActionResponse> {
        let skills = await this.Store('skill').fetchMySkills()
        skills.sort((a, b) => {
            const name1 = a.name.toLowerCase()
            const name2 = b.name.toLowerCase()

            if (name1 < name2) {
                return -1
            } else if (name1 > name2) {
                return 1
            }

            return 0
        })

        const dep = this.Service('dependency')
        const dependencies = dep.get()

        const currentSkill = await this.Store('skill').loadCurrentSkill()

        if (currentSkill.isRegistered) {
            skills = skills.filter((s) => s.id !== currentSkill.id)
        }

        const selected = await this.ui.prompt({
            label: 'Which skills do you depend on?',
            type: 'select',
            isArray: true,
            isRequired: true,
            value: dependencies.map((d: any) => d.id),
            options: {
                choices: skills.map((skill) => ({
                    value: skill.id,
                    label: skill.name + ' (' + skill.slug + ')',
                })),
            },
        })

        const summary: string[] = []

        const updatedDependencies = selected.map((id) => {
            const skill = skills.find((s) => s.id === id)

            summary.push(skill?.name + ' (' + skill?.id + ')')

            return {
                id,
                namespace: skill?.slug ?? '**missing**',
            }
        })

        dep.set(updatedDependencies)

        return {
            summaryLines: [
                `${updatedDependencies.length} dependenc${
                    updatedDependencies.length === 1 ? 'y' : 'ies'
                } added.`,
                ...summary,
            ],
        }
    }
}
