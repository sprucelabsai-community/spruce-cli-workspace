import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export const optionsSchema = buildSchema({
    id: 'publish',
    name: 'Publish',
    description: 'Publish a skill to make it available to the world!',
    fields: {
        isInstallable: {
            type: 'boolean',
            label: 'Make skill installable',
            hint: 'Defaults to true. If disabled, your skill is available without needing to be installed. Note: This requires owner role at the platform level.',
        },
    },
})

export type PublishActionDefinition = typeof optionsSchema

export default class PublishAction extends AbstractAction<PublishActionDefinition> {
    public optionsSchema = optionsSchema
    public invocationMessage = 'Publishing... ⚡️'

    public async execute(
        options?: PublishActionOptions
    ): Promise<FeatureActionResponse> {
        const { isInstallable } = this.validateAndNormalizeOptions(
            options ?? {}
        )
        const skills = this.Store('skill')
        await skills.publish({ isInstallable })

        return {
            summaryLines: ['Your skill has been published!'],
        }
    }
}

type OptionsSchema = typeof optionsSchema
export type PublishActionOptions = SchemaValues<OptionsSchema>
