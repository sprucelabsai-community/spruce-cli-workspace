import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'featureNotInstalled',
    name: 'Feature not installed',
    description: '',
    fields: {
        featureCode: {
            type: 'text',
            isRequired: true,
        },
    },
})
