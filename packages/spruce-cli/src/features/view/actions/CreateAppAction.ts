import { buildSchema } from '@sprucelabs/schema'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class CreateAppAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public invocationMessage = 'Creating new app view controller... '
    public readonly commandAliases = ['create.avc', 'create.app']

    public async execute(): Promise<FeatureActionResponse> {
        const writer = this.Writer('view', {})
        const id = await this.Store('skill').loadCurrentSkillsNamespace()
        const files = await writer.writeAppController(
            this.cwd,
            id.toLocaleLowerCase(),
            id
        )

        const results = await this.Action('view', 'sync').execute({})
        const merged = actionUtil.mergeActionResults(
            {
                files,
            },
            results
        )

        return merged
    }
}

const optionsSchema = buildSchema({
    id: 'createAppControllerOptions',
    fields: {},
})

type OptionsSchema = typeof optionsSchema
