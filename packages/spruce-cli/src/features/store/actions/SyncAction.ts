import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractFeatureAction from '../../AbstractFeatureAction'
import StoreTemplateItemBuilder from '../templateItemBuilders/StoreTemplateItemBuilder'

const optionsSchema = buildSchema({
	id: 'syncDataStoreOptions',
	fields: {},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class SyncAction extends AbstractFeatureAction<OptionsSchema> {
	public code = 'sync.stores'
	public optionsSchema = optionsSchema

	public async execute(_options: Options) {
		try {
			const stores = await this.Store('store').fetchStores()

			let files: GeneratedFile[] = []

			if (stores.length > 0) {
				const destination = diskUtil.resolveHashSprucePath(this.cwd, 'stores')
				const builder = new StoreTemplateItemBuilder()
				const templateItems = builder.buildTemplateItems(stores, destination)

				files = await this.Writer('store').writeTypes(destination, {
					stores: templateItems,
				})
			}

			return {
				files,
			}
		} catch (err) {
			return {
				errors: [err],
			}
		}
	}
}