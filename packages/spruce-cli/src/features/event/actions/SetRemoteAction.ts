import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { Remote } from '../constants'

const optionsSchema = buildSchema({
	id: 'setRemoteOptions',
	description: 'Point your skill to different Mercury environments.',
	fields: {
		remote: {
			label: 'Where should remote point?',
			type: 'select',
			isRequired: true,
			options: {
				choices: [
					{
						value: 'local',
						label: 'Local',
					},
					{
						value: 'dev',
						label: 'Development',
					},
					{
						value: 'sandbox',
						label: 'Sandbox',
					},
					{
						value: 'prod',
						label: 'Production',
					},
				],
			},
		},
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class SyncAction extends AbstractAction<OptionsSchema> {
	public commandAliases = ['set.remote']
	public optionsSchema: OptionsSchema = optionsSchema
	public invocationMessage = 'Set remote... 🜒'

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { remote } = this.validateAndNormalizeOptions(options)

		const r = this.Service('remote')
		r.set(remote as Remote)

		return {
			summaryLines: [`Remote: ${remote}`, `Host: ${r.getHost()}`],
		}
	}
}
