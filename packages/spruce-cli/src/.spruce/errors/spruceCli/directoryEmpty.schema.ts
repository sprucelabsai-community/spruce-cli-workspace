import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const directoryEmptySchema: SpruceErrors.SpruceCli.DirectoryEmptySchema = {
    id: 'directoryEmpty',
    namespace: 'SpruceCli',
    name: 'directory empty',
    fields: {
        /** . */
        directory: {
            type: 'text',
            isRequired: true,
            options: undefined,
        },
    },
}

SchemaRegistry.getInstance().trackSchema(directoryEmptySchema)

export default directoryEmptySchema
