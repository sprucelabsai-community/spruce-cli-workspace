import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import syncEventActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncEventOptions.schema'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import EventFeature from '../EventFeature'

type OptionsSchema = SpruceSchemas.SpruceCli.v2020_07_22.SyncEventOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.SyncEventOptions

export default class SyncAction extends AbstractAction<OptionsSchema> {
	public commandAliases = ['sync.events']
	public optionsSchema: OptionsSchema = syncEventActionSchema
	public invocationMessage = 'Syncing event contracts... 🜒'

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const builder = this.ContractBuilder()

		const results: FeatureActionResponse = await builder.fetchAndWriteContracts(
			options
		)

		if (results.errors) {
			return {
				errors: results.errors,
			}
		}

		this.Service('eventSettings').setLastSyncOptions(options)

		const schemaSyncResults = await this.Action('schema', 'sync').execute({})

		const mergedResults = actionUtil.mergeActionResults(
			schemaSyncResults,
			results
		)

		return mergedResults
	}

	private ContractBuilder() {
		return (this.parent as EventFeature).getEventContractBuilder()
	}
}
