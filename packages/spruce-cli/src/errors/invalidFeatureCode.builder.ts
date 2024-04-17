import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'invalidFeatureCode',
    name: 'Invalid feature code',
    description: '',
    fields: {
        featureCode: {
            type: 'text',
            isRequired: true,
        },
    },
})
