import { buildErrorSchema } from '@sprucelabs/schema'

const fileExistsDefinition = buildErrorSchema({
    id: 'fileExists',
    name: 'fileExists',
    description: 'The file already exists',
    fields: {
        file: {
            type: 'text',
            label: 'File',
            isRequired: true,
            hint: 'The file being created',
        },
    },
})

export default fileExistsDefinition
