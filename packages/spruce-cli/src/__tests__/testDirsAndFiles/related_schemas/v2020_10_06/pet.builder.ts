import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'pet',
    name: 'Pet',
    description: 'It is going to be great!',
    fields: {
        name: {
            type: 'text',
            isRequired: true,
        },
    },
})
