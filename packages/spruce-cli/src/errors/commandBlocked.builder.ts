import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'commandBlocked',
    name: 'Command blocked',
    description: '',
    fields: {
        command: {
            type: 'text',
            isRequired: true,
        },
        hint: {
            type: 'text',
            isRequired: true,
        },
    },
})
