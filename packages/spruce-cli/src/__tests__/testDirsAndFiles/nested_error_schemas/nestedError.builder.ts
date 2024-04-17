import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'good',
    name: 'Good one',
    description: 'Another for testing',
    fields: {
        relatedSchema: {
            type: 'schema',
            label: 'Related schema',
            options: {
                schema: {
                    id: 'nestedSchema',
                    name: 'Nested Schema',
                    fields: {
                        field1: {
                            type: 'text',
                        },
                        field2: {
                            type: 'text',
                        },
                    },
                },
            },
        },
    },
})
