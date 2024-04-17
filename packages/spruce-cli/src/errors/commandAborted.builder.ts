import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'commandAborted',
    name: 'Command aborted',
    description: '',
    fields: {
        command: {
            type: 'text',
            label: 'Command',
            isRequired: true,
        },
    },
})
