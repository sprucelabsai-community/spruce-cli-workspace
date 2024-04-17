import { SchemaRegistry } from '@sprucelabs/schema'
import generatedDirSchema_v2020_07_22 from '#spruce/schemas/spruceCli/v2020_07_22/generatedDir.schema'
import generatedFileSchema_v2020_07_22 from '#spruce/schemas/spruceCli/v2020_07_22/generatedFile.schema'
import { SpruceSchemas } from '../../schemas.types'

const watcherDidDetectChangesEmitPayloadSchema: SpruceSchemas.SpruceCli.v2020_07_22.WatcherDidDetectChangesEmitPayloadSchema =
    {
        id: 'watcherDidDetectChangesEmitPayload',
        version: 'v2020_07_22',
        namespace: 'SpruceCli',
        name: 'Watcher did detect changes emit payload',
        fields: {
            /** . */
            changes: {
                type: 'schema',
                isRequired: true,
                isArray: true,
                options: {
                    schemas: [
                        generatedFileSchema_v2020_07_22,
                        generatedDirSchema_v2020_07_22,
                    ],
                },
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(
    watcherDidDetectChangesEmitPayloadSchema
)

export default watcherDidDetectChangesEmitPayloadSchema
