import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'setupTestsOptions',
    name: 'Setup tests options',
    description:
        'Use this with in your CI/CD environment to get your skill ready to run tests.',
    fields: {
        demoNumber: {
            type: 'phone',
            label: 'Demo phone number',
            isRequired: true,
        },
        skillSlug: {
            type: 'text',
            label: 'Namespace',
            isRequired: true,
        },
    },
})
