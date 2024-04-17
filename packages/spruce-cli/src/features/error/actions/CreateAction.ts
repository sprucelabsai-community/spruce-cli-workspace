import { normalizeSchemaValues } from '@sprucelabs/schema'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import createErrorActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/createErrorOptions.schema'
import createSchemaActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/createSchemaOptions.schema'
import syncErrorActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncErrorOptions.schema'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

type OptionsSchema =
    SpruceSchemas.SpruceCli.v2020_07_22.CreateErrorOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.CreateErrorOptions
export default class CreateAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = createErrorActionSchema
    public invocationMessage = 'Creating a new error builder... 🤾‍♀️'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const normalizedOptions = this.validateAndNormalizeOptions(options)

        const schemaCreateAction = this.Action('schema', 'create')

        const createSchemaOptions = normalizeSchemaValues(
            createSchemaActionSchema,
            {
                ...normalizedOptions,
                builderFunction: 'buildErrorSchema',
                shouldEnableVersioning: false,
                syncAfterCreate: false,
                schemaBuilderDestinationDir:
                    normalizedOptions.errorBuilderDestinationDir,
            }
        )

        const createResults =
            await schemaCreateAction.execute(createSchemaOptions)

        const syncOptions = normalizeSchemaValues(
            syncErrorActionSchema,
            normalizedOptions
        )
        const syncResults = await this.Action('error', 'sync').execute(
            syncOptions
        )
        const mergedResults = actionUtil.mergeActionResults(
            createResults,
            syncResults
        )

        return mergedResults
    }
}
