import { buildErrorSchema } from '@sprucelabs/schema'

const lintFailedDefinition = buildErrorSchema({
    id: 'lintFailed',
    name: 'Lint failed!',
    description: 'When linting a file fails',
    fields: {
        pattern: {
            type: 'text',
            label: 'Pattern',
            hint: 'The pattern used to match files relative to the root of the skill',
            isRequired: true,
        },
    },
})

export default lintFailedDefinition
