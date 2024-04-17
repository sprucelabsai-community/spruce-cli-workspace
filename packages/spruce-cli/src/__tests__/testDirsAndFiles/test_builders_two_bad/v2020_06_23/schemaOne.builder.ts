import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'schemaOne',
    name: 'First schema',
    description: 'It is going to be great!',
    fields: {
        name: {
            type: 'text',
            isRequired: true,
        },
        nestedSchema: {
            type: 'schema',
            options: {
                schema: buildSchema({
                    id: 'nested-inline-schema',
                    name: 'nested with dynamic fields',
                    dynamicFieldSignature: {
                        keyName: 'prop',
                        type: 'text',
                    },
                }),
            },
        },
    },
})
