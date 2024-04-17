import {
    SchemaTemplateItem,
    normalizeSchemaValues,
    SchemaValuesWithDefaults,
} from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { ErrorTemplateItem } from '@sprucelabs/spruce-templates'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import syncErrorActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncErrorOptions.schema'
import syncSchemasActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncSchemasOptions.schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse, FeatureAction } from '../../features.types'
import ErrorWriter from '../writers/ErrorWriter'

type OptionsSchema = SpruceSchemas.SpruceCli.v2020_07_22.SyncErrorOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.SyncErrorOptions
export default class SyncAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = syncErrorActionSchema
    public commandAliases = ['sync.errors']
    public invocationMessage = 'Generating error types... 🤾‍♀️'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const normalizedOptions = this.validateAndNormalizeOptions(options)
        const { errorTypesDestinationDir, errorClassDestinationDir } =
            normalizedOptions

        const schemaSyncAction = this.Action(
            'schema',
            'sync'
        ) as any as FeatureAction<SpruceSchemas.SpruceCli.v2020_07_22.SyncSchemasOptionsSchema>

        const errorSyncResults = await this.syncErrors(
            schemaSyncAction,
            normalizedOptions
        )

        if (errorSyncResults.errors) {
            return errorSyncResults
        }

        if (this.areSyncResultsEmpty(errorSyncResults)) {
            this.deleteOrphanedDirs(errorTypesDestinationDir)
            return {}
        }

        const { schemaTemplateItems } = errorSyncResults.meta as {
            schemaTemplateItems: SchemaTemplateItem[]
        }

        const errorTemplateItems = schemaTemplateItems.map((item) => ({
            ...item,
            code: namesUtil.toConst(item.namePascal),
        }))

        const errorWriter = this.Writer('error')

        const optionsResults = await this.generateOptionTypes(
            errorWriter,
            errorTemplateItems,
            errorTypesDestinationDir
        )

        const errorClassGeneratedFiles =
            await errorWriter.writeOrAppendErrorsToClass(
                diskUtil.resolvePath(this.cwd, errorClassDestinationDir),
                errorTemplateItems
            )

        return {
            files: [
                ...(errorSyncResults.files ?? []),
                ...errorClassGeneratedFiles,
                ...optionsResults,
            ],
        }
    }

    private deleteOrphanedDirs(errorTypesDestinationDir: string) {
        diskUtil.deleteDir(
            diskUtil.resolvePath(this.cwd, errorTypesDestinationDir)
        )
    }

    private async syncErrors(
        schemaSyncAction: FeatureAction<SpruceSchemas.SpruceCli.v2020_07_22.SyncSchemasOptionsSchema>,
        normalizedOptions: SchemaValuesWithDefaults<SpruceSchemas.SpruceCli.v2020_07_22.SyncErrorOptionsSchema>
    ) {
        const resolvedErrorTypesDestinationDir = diskUtil.resolvePath(
            this.cwd,
            normalizedOptions.errorTypesDestinationDir,
            'errors.types.ts'
        )

        const syncOptions = normalizeSchemaValues(syncSchemasActionSchema, {
            ...normalizedOptions,
            schemaTypesDestinationDirOrFile: resolvedErrorTypesDestinationDir,
            schemaLookupDir: normalizedOptions.errorLookupDir,
            shouldEnableVersioning: false,
            globalSchemaNamespace: 'SpruceErrors',
            shouldFetchRemoteSchemas: false,
            generateFieldTypes: true,
            generateStandaloneTypesFile: true,
            deleteDestinationDirIfNoSchemas: true,
            shouldFetchCoreSchemas: false,
            syncingMessage: 'Syncing errors...',
        })

        const errorSyncResults = await schemaSyncAction.execute(syncOptions)

        return errorSyncResults
    }

    private areSyncResultsEmpty(errorSyncResults: FeatureActionResponse) {
        return (
            !errorSyncResults.meta ||
            !errorSyncResults.files ||
            errorSyncResults.files.length === 0
        )
    }

    private async generateOptionTypes(
        errorGenerator: ErrorWriter,
        errorTemplateItems: ErrorTemplateItem[],
        errorTypesDestinationDir: string
    ) {
        if (errorTemplateItems.length === 0) {
            return []
        }

        const resolvedTypesDestination = diskUtil.resolvePath(
            this.cwd,
            errorTypesDestinationDir
        )

        const topLevelItems = errorTemplateItems.filter((i) => !i.isNested)

        const optionsResults = await errorGenerator.writeOptionsTypesFile(
            resolvedTypesDestination,
            topLevelItems
        )

        return optionsResults
    }
}
