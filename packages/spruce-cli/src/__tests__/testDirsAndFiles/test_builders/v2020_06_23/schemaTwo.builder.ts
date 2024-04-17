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
        favoriteColors: {
            type: 'text',
            isArray: true,
            minArrayLength: 3,
        },
        permissions: {
            type: 'schema',
            isRequired: true,
            isArray: true,
            minArrayLength: 0,
            options: {
                schema: {
                    id: 'permission',
                    name: 'Permission',
                    fields: {
                        id: {
                            type: 'text',
                            label: 'id',
                            isRequired: true,
                            hint: 'Hyphen separated di for this permission, e.g. can-unlock-doors',
                        },
                        name: {
                            type: 'text',
                            label: 'Name',
                            isRequired: true,
                            hint: 'Human readable name for this permission',
                        },
                        description: {
                            type: 'text',
                            label: 'Description',
                        },
                        requireAllStatuses: {
                            type: 'boolean',
                            label: 'Require all statuses',
                            defaultValue: false,
                        },
                    },
                },
            },
        },
    },
})
