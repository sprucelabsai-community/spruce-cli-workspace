import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'registerAgentOptions',
    description:
        'Turn Sprucebot into an agent of your own design. Heck, even give him a new name! You can create a Platform Agent or a Skill Agent. Skill Agent coming soon...',
    fields: {
        type: {
            label: 'Agent Type',
            type: 'select',
            hint: 'You can only create a System Agent if you have permission to do so...',
            options: {
                choices: [
                    {
                        value: 'system',
                        label: 'System Agent',
                    },
                    {
                        value: 'skill',
                        label: 'Skill Agent (coming soon)',
                    },
                ],
            },
        },
        name: {
            type: 'text',
            label: 'Agent Name',
            isRequired: true,
        },
    },
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class RegisterAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public invocationMessage = 'Registering your AI Agent... 🤖'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const { name } = this.validateAndNormalizeOptions(options)

        const writer = this.Writer('agent')
        const plugin = await writer.writePlugin(this.cwd)
        const prompt = await writer.writeSystemPrompt(this.cwd, {
            name,
        })

        return {
            files: [...plugin, ...prompt],
        }
    }
}
