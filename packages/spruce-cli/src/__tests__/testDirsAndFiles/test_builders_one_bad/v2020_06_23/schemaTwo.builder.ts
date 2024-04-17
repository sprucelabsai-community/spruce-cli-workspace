import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'schemaTwo',
    name: 'Second schema',
    description: 'It is going to be greater, I thin!',
    fields: {
        phone: {
            type: 'phone',
            isRequired: true,
        },
        relatedToBad: {
            type: 'schema',
            options: {
                schemaId: { id: 'badSchema', version: 'v2020_06_23' },
            },
        },
    },
})
