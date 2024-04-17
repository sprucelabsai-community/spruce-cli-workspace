import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'buildFailed',
    name: 'BuildFailed',
    description:
        'Error thrown when building or linting failed. Happens when a yarn command fails inside the package utility.',
    fields: {
        file: {
            type: 'text',
            label: 'File',
            hint: 'File we wanted to build, if not set we wanted to build everything..',
        },
    },
})
