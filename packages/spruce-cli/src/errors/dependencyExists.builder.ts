import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'dependencyExists',
    name: 'Dependency exists',
    fields: {
        namespace: {
            type: 'text',
            isRequired: true,
        },
    },
})
