import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'schemaExists',
    name: 'Schema exists',
    description: '',
    fields: {
        schemaId: {
            type: 'text',
            label: 'Schema id',
            isRequired: true,
        },
        destination: {
            type: 'text',
            label: 'Destination',
        },
    },
})
