import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'food',
    name: 'Food',
    description: 'It is going to be yummy!',
    fields: {
        name: {
            type: 'text',
            isRequired: true,
        },
    },
})
