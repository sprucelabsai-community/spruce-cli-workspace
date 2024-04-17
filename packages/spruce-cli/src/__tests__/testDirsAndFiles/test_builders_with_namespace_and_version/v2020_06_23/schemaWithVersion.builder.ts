import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'schemaWithVersion',
    name: 'First schema',
    description: 'It is going to be great!',
    version: '1.0',
    fields: {
        name: {
            type: 'text',
            isRequired: true,
        },
        nestedSchema: {
            type: 'schema',
            options: {
                schema: buildSchema({
                    id: 'nested-inline-schema-with-version',
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
