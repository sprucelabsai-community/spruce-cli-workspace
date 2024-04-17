import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'invalidEventContract',
    name: 'invalid event contract',
    description: '',
    fields: {
        fullyQualifiedEventName: {
            type: 'text',
            isRequired: true,
        },
        brokenProperty: {
            type: 'text',
            isRequired: true,
        },
    },
})
