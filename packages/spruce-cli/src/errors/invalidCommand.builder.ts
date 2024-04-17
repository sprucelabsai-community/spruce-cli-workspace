import { buildErrorSchema } from '@sprucelabs/schema'

const invalidParamsDefinition = buildErrorSchema({
    id: 'invalidCommand',
    name: 'Invalid command',
    description: 'The command is not valid, try --help',
    fields: {
        args: {
            type: 'text',
            label: 'args',
            isArray: true,
            isRequired: true,
        },
    },
})

export default invalidParamsDefinition
