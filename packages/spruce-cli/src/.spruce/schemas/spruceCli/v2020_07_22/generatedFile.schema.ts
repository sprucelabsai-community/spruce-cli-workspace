import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

const generatedFileSchema: SpruceSchemas.SpruceCli.v2020_07_22.GeneratedFileSchema =
    {
        id: 'generatedFile',
        version: 'v2020_07_22',
        namespace: 'SpruceCli',
        name: '',
        fields: {
            /** . */
            name: {
                type: 'text',
                isRequired: true,
                options: undefined,
            },
            /** . */
            path: {
                type: 'text',
                isRequired: true,
                options: undefined,
            },
            /** . */
            description: {
                type: 'text',
                options: undefined,
            },
            /** . */
            action: {
                type: 'select',
                isRequired: true,
                options: {
                    choices: [
                        { label: 'Skipped', value: 'skipped' },
                        { label: 'Generated', value: 'generated' },
                        { label: 'Updated', value: 'updated' },
                        { label: 'Deleted', value: 'deleted' },
                    ],
                },
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(generatedFileSchema)

export default generatedFileSchema
