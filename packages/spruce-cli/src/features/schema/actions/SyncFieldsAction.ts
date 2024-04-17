import { SchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import syncSchemaFieldsActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncSchemaFieldsOptions.schema'
import FieldTemplateItemBuilder from '../../../templateItemBuilders/FieldTemplateItemBuilder'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

type OptionsSchema =
    SpruceSchemas.SpruceCli.v2020_07_22.SyncSchemaFieldsOptionsSchema

export default class FieldsSyncAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = syncSchemaFieldsActionSchema
    public commandAliases = ['sync.fields']
    public invocationMessage =
        'Syncing schema field types (e.g. number, phone, etc.)... 📃'

    public async execute(
        options: SchemaValues<OptionsSchema>
    ): Promise<FeatureActionResponse> {
        this.ui.startLoading(`Syncing fields...`)

        const normalizedOptions = this.validateAndNormalizeOptions(options)

        const {
            fieldTypesDestinationDir,
            addonsLookupDir,
            generateFieldTypes,
        } = normalizedOptions

        const resolvedFieldTypesDestination = diskUtil.resolvePath(
            this.cwd,
            fieldTypesDestinationDir
        )

        const generatedFiles: GeneratedFile[] = []
        const schemaStore = this.Store('schema')

        this.ui.startLoading('Pulling field types...')

        const { fields, errors } = await schemaStore.fetchFields({
            localAddonsDir: diskUtil.resolvePath(this.cwd, addonsLookupDir),
        })

        const fieldTemplateItemBuilder = new FieldTemplateItemBuilder()
        const fieldTemplateItems =
            fieldTemplateItemBuilder.generateTemplateItems(fields)

        const schemaGenerator = this.Writer('schema')
        if (generateFieldTypes) {
            const results = await schemaGenerator.writeFieldTypes(
                resolvedFieldTypesDestination,
                {
                    fieldTemplateItems,
                }
            )

            generatedFiles.push(...results)
        }

        this.ui.stopLoading()

        return {
            files: generatedFiles,
            errors: errors.length > 0 ? errors : undefined,
            meta: {
                fieldTemplateItems,
            },
        }
    }
}
