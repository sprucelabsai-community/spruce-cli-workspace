import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'organization',
    name: 'Organization',
    description: 'A company or team. Comprises of many people and locations.',
    fields: {
        id: {
            label: 'Id',
            type: 'id',
            isRequired: true,
        },
        name: {
            label: 'Name',
            type: 'text',
            isRequired: true,
        },
        slug: {
            label: 'Slug',
            type: 'text',
            isRequired: true,
        },
        dateCreated: {
            type: 'number',
            isRequired: true,
        },
        dateDeleted: {
            type: 'number',
        },
    },
})
