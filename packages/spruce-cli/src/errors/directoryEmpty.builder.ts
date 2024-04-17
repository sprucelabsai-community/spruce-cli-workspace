import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'directoryEmpty',
    name: 'directory empty',
    description: '',
    fields: {
        directory: {
            type: 'text',
            isRequired: true,
        },
    },
})
