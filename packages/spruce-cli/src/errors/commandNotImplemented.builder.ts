import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'commandNotImplemented',
    name: 'Command not implemented',
    description: 'This command has not yet been implemented ',
    fields: {
        command: {
            type: 'text',
            label: 'Command',
            isRequired: true,
            hint: 'the command being run!',
        },
        args: {
            type: 'text',
            label: 'Args',
            isRequired: false,
            isArray: true,
            hint: 'Arguments passed to the command',
        },
    },
})
