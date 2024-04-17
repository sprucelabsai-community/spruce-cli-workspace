import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'testPerson',
    name: 'test person',
    description: 'It is going to be great!',
    fields: {
        name: {
            type: 'text',
            isRequired: true,
        },
        pet: {
            type: 'schema',
            options: {
                schemaId: { id: 'pet', version: 'v2020_10_06' },
            },
        },
        pets: {
            type: 'schema',
            isArray: true,
            options: {
                schemaId: { id: 'pet', version: 'v2020_10_06' },
            },
        },
        petsOrFoods: {
            type: 'schema',
            isArray: true,
            options: {
                schemaIds: [
                    { id: 'pet', version: 'v2020_10_06' },
                    { id: 'food', version: 'v2020_10_06' },
                ],
            },
        },
        petOrFood: {
            type: 'schema',
            options: {
                schemaIds: [
                    { id: 'pet', version: 'v2020_10_06' },
                    { id: 'food', version: 'v2020_10_06' },
                ],
            },
        },
        nestedSchema: {
            type: 'schema',
            options: {
                schema: {
                    id: 'nested-schema',
                    name: 'nested schema',
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
        nestedSchemaWithDifferentVersion: {
            type: 'schema',
            options: {
                schema: {
                    id: 'nested-schema',
                    version: 'v2021_01_01',
                    name: 'nested schema',
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
