import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractAction from '../../AbstractAction'
import StoreTemplateItemBuilder from '../templateItemBuilders/StoreTemplateItemBuilder'

const optionsSchema = buildSchema({
    id: 'syncDataStoreOptions',
    description:
        "Only needed if you change a store's name, manually add or remove one.",
    fields: {},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class SyncAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public commandAliases = ['sync.stores']
    public invocationMessage =
        'Generating store types and setting up store factory... 💿'

    public async execute(_options: Options) {
        try {
            const stores = await this.Store('store').fetchStores()

            let files: GeneratedFile[] = []

            if (stores.length > 0) {
                const destination = diskUtil.resolveHashSprucePath(
                    this.cwd,
                    'stores'
                )
                const builder = new StoreTemplateItemBuilder()
                const templateItems = builder.buildTemplateItems(
                    stores,
                    destination
                )

                const writer = this.Writer('store')
                files = await writer.writeTypesAndMap(destination, {
                    stores: templateItems,
                })
            }

            return {
                files,
            }
        } catch (err: any) {
            return {
                errors: [err],
            }
        }
    }
}
