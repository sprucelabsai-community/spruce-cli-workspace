import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'schemaWithNamespace',
    name: 'First schema',
    description: 'It is going to be great!',
    namespace: 'Should not be here',
    fields: {
        name: {
            type: 'text',
            isRequired: true,
        },
        nestedSchema: {
            type: 'schema',
            options: {
                schema: buildSchema({
                    id: 'nested-inline-schema-with-namespace',
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
