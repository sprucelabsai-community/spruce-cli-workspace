import { buildErrorSchema } from '@sprucelabs/schema'

const failedToImportDefinition = buildErrorSchema({
    id: 'failedToImport',
    name: 'FailedToImport',
    description: 'Failed to import a file through VM',
    fields: {
        file: {
            type: 'text',
            label: 'File',
            isRequired: true,
            hint: 'The file I tried to import',
        },
    },
})

export default failedToImportDefinition
