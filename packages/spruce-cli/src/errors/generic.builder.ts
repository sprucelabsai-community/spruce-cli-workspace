import { buildErrorSchema } from '@sprucelabs/schema'

const genericDefinition = buildErrorSchema({
    id: 'generic',
    name: 'generic',
    description: "When you're too lazy to make a new error",
    fields: {
        friendlyMessageSet: {
            type: 'text',
            label: 'Friendly message',
        },
    },
})

export default genericDefinition
