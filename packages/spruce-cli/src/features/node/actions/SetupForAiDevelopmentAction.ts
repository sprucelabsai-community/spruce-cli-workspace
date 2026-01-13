import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'setupForAiDevelopmentOptions',
    fields: {},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class SetupForAiDevelopmentAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public commandAliases = ['setup.ai']
    public invocationMessage = 'Setting up for AI-assisted development... 🤖'

    public async execute(_options: Options): Promise<FeatureActionResponse> {
        const writer = this.Writer('node')
        const files = await writer.writeAiDevelopmentFiles(this.cwd)

        return { files }
    }
}
