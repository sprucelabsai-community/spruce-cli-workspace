import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const testFailedSchema: SpruceErrors.SpruceCli.TestFailedSchema = {
    id: 'testFailed',
    namespace: 'SpruceCli',
    name: 'Test failed',
    fields: {
        /** . */
        fileName: {
            type: 'text',
            isRequired: true,
            options: undefined,
        },
        /** . */
        testName: {
            type: 'text',
            isRequired: true,
            options: undefined,
        },
        /** . */
        errorMessage: {
            type: 'text',
            isRequired: true,
            options: undefined,
        },
    },
}

SchemaRegistry.getInstance().trackSchema(testFailedSchema)

export default testFailedSchema
