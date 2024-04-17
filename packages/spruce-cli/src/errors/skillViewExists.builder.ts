import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'skillViewExists',
    name: 'Skill view exists',
    description: '',
    fields: {
        name: {
            type: 'text',
            isRequired: true,
        },
    },
})
