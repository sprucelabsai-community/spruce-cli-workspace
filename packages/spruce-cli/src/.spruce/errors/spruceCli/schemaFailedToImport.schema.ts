import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const schemaFailedToImportSchema: SpruceErrors.SpruceCli.SchemaFailedToImportSchema =
    {
        id: 'schemaFailedToImport',
        namespace: 'SpruceCli',
        name: 'Definition failed to import',
        description: 'The definition file failed to import',
        fields: {
            /** File. The file definition file I tried to import */
            file: {
                label: 'File',
                type: 'text',
                isRequired: true,
                hint: 'The file definition file I tried to import',
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(schemaFailedToImportSchema)

export default schemaFailedToImportSchema
