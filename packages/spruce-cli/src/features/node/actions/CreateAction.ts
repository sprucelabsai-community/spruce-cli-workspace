import { SpruceSchemas } from '@sprucelabs/spruce-core-schemas'
import nodeFeatureOptionsSchema from '#spruce/schemas/spruceCli/v2020_07_22/nodeFeatureOptions.schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = nodeFeatureOptionsSchema

type OptionsSchema =
	SpruceSchemas.SpruceCli.v2020_07_22.NodeFeatureOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.NodeFeatureOptions

export default class CreateAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Setting up a new mode module! 🤖'
	public optionsSchema = optionsSchema
	public async execute(options: Options): Promise<FeatureActionResponse> {
		const codeSuggestion = options.destination
			? `cd ${options.destination} && code .`
			: `code .`

		return {
			hints: [
				'Your new module is ready!',
				`When you're ready, go ahead and run \`${codeSuggestion}\` to open vscode.`,
			],
		}
	}
}
