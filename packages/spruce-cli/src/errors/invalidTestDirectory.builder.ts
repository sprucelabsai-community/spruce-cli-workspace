import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'invalidTestDirectory',
    name: 'invalid test directory',
    description: '',
    fields: {
        dir: {
            type: 'text',
            isRequired: true,
        },
    },
})
