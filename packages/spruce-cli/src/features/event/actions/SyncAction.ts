import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import syncEventActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncEventAction.schema'
import AbstractFeatureAction from '../../AbstractFeatureAction'
import { FeatureActionResponse } from '../../features.types'

type OptionsSchema = SpruceSchemas.SpruceCli.v2020_07_22.SyncEventActionSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.SyncEventAction

export default class SyncAction extends AbstractFeatureAction<OptionsSchema> {
	public name = 'sync'
	public optionsSchema: OptionsSchema = syncEventActionSchema

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const normalizedOptions = this.validateAndNormalizeOptions(options)

		const { contractDestinationFile } = normalizedOptions

		const resolvedDestination = diskUtil.resolvePath(
			this.cwd,
			contractDestinationFile
		)

		this.ui.startLoading('Pulling contracts...')

		const store = this.Store('event')
		const contractResults = await store.fetchEventContracts()

		if (contractResults.errors.length > 0) {
			return {
				errors: contractResults.errors,
			}
		}

		const generator = this.Generator('event')
		const files = await generator.generateContract(resolvedDestination, {
			...normalizedOptions,
			contracts: contractResults.contracts,
		})

		return {
			files,
		}
	}
}
