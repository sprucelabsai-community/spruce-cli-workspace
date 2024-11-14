import { buildSchema } from '@sprucelabs/schema'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class CreateAppAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public invocationMessage = 'Creating new app view controller... '
    public readonly commandAliases = ['create.avc']

    public async execute(): Promise<FeatureActionResponse> {
        const writer = this.Writer('view', {})
        const files = await writer.writeAppController(this.cwd)

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
