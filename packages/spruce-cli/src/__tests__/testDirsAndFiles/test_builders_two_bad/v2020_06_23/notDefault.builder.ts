import { buildSchema } from '@sprucelabs/schema'

export const schema = buildSchema({
    id: 'notDefault',
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
                    id: 'notDefaultInline',
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
