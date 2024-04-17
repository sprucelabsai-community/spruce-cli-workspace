import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import skillFeatureSchema from '#spruce/schemas/spruceCli/v2020_07_22/skillFeature.schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'createSkill',
    name: 'create skill',
    description:
        'A skill is a micro-app, focused on delivering personaziled (and discrete) experiences.',
    fields: {
        ...skillFeatureSchema.fields,
    },
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class CreateAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public commandAliases = ['create.skill [destination]']
    public invocationMessage = 'Creating your new skill... ⚡️'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const codeSuggestion = options.destination
            ? `cd ${options.destination} && code .`
            : `code .`

        return {
            hints: [
                'This is so much fun! Lets keep moving.',
                `When you're ready, go ahead and run \`${codeSuggestion}\` to open vscode.`,
                'Once vscode loads, open the terminal and type `spruce setup.vscode`',
                "Hint: You're going to want to install all extensions and setup all features (yes for everything).",
                'See you there! 💪',
            ],
        }
    }
}
