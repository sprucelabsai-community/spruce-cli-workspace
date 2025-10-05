import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'agentAlreadyRegistered',
    name: 'agent already registered',
    fields: {
        promptPath: {
            type: 'text',
            isRequired: true,
            label: 'Prompt Path',
            hint: 'The path to the existing agent prompt file.',
        },
    },
})
