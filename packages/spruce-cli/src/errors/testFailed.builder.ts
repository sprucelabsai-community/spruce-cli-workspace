import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'testFailed',
    name: 'Test failed',
    description: '',
    fields: {
        fileName: {
            type: 'text',
            isRequired: true,
        },
        testName: {
            type: 'text',
            isRequired: true,
        },
        errorMessage: {
            type: 'text',
            isRequired: true,
        },
    },
})
