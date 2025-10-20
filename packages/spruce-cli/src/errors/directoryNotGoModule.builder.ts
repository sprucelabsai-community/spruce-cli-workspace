import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'directoryNotGoModule',
    name: 'Directory not go module',
    fields: {
        cwd: {
            type: 'text',
            label: 'Current Working Directory',
            isRequired: true,
        },
    },
})
