import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const invalidTestDirectorySchema: SpruceErrors.SpruceCli.InvalidTestDirectorySchema =
    {
        id: 'invalidTestDirectory',
        namespace: 'SpruceCli',
        name: 'invalid test directory',
        fields: {
            /** . */
            dir: {
                type: 'text',
                isRequired: true,
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(invalidTestDirectorySchema)

export default invalidTestDirectorySchema
