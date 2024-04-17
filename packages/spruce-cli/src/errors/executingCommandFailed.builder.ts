import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'executingCommandFailed',
    name: 'Executing command failed',
    description: 'The command that was being executed failed',
    fields: {
        cmd: {
            type: 'text',
            label: 'The command being run',
        },
        args: {
            type: 'text',
            label: 'Args',
            isArray: true,
        },
        cwd: {
            type: 'text',
            label: 'Cwd',
        },
        stdout: {
            type: 'text',
            label: 'Stdout',
        },
        stderr: {
            type: 'text',
            label: 'stderr',
        },
    },
})
