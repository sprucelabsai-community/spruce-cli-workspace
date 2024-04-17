import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

const setupVscodeOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.SetupVscodeOptionsSchema =
    {
        id: 'setupVscodeOptions',
        version: 'v2020_07_22',
        namespace: 'SpruceCli',
        name: 'Setup vscode action',
        description:
            'Install vscode extensions, launch configs, and settings the Spruce team uses in-house!',
        fields: {
            /** Install everything. */
            all: {
                label: 'Install everything',
                type: 'boolean',
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(setupVscodeOptionsSchema)

export default setupVscodeOptionsSchema
