import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import InFlightEntertainment from '../../../InFlightEntertainment'
import AbstractFeatureAction from '../../AbstractFeatureAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'rebuildOptions',
	description:
		'Clear the build and node_modules folder and start from the top.',
	fields: {
		shouldPlayGames: {
			type: 'boolean',
			label: 'Play games',
			defaultValue: true,
		},
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class RebuildAction extends AbstractFeatureAction<OptionsSchema> {
	public code = 'rebuild'
	public optionsSchema: OptionsSchema = optionsSchema
	public commandAliases = ['rebuild']
	public invocationMessage = 'Rebuiding your skill... ⚡️'

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { shouldPlayGames } = this.validateAndNormalizeOptions(options)
		const command = this.Service('command')

		try {
			if (shouldPlayGames) {
				InFlightEntertainment.start()
			} else {
				this.ui.startLoading('Rebuilding....')
			}
			await command.execute('yarn rebuild', {
				onData: (data: string) => {
					InFlightEntertainment?.writeStatus(data)
				},
			})
		} catch (err) {
			return {
				errors: [err],
			}
		}

		InFlightEntertainment.stop()

		this.ui.stopLoading()

		return {
			summaryLines: [
				'☑️ node_modules cleared.',
				'☑️ node_modules installed.',
				'☑️ Build folder cleared.',
				'☑️ Build complete.',
			],
		}
	}
}
