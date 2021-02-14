import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { buildSchema } from '@sprucelabs/schema'
import AbstractFeatureAction from '../../AbstractFeatureAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'createSkill',
	name: 'create skill',
	fields: {},
})

type OptionsSchema = typeof optionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.SkillFeature

export default class CreateAction extends AbstractFeatureAction<OptionsSchema> {
	public code = 'create'
	public optionsSchema = optionsSchema
	public commandAliases = ['create.skill [destination]']

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const codeSuggestion = options.destination
			? `cd ${options.destination} && code .`
			: `code .`

		return {
			hints: [
				'This is so much fun! Lets keep moving.',
				`When you're ready, go ahead and run \`${codeSuggestion}\` to open vscode.`,
				'Once vscode loads, open the terminal and type `spruce setup.vscode`',
				'See you there! 💪',
			],
		}
	}
}
