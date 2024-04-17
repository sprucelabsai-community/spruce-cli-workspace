import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'schemaFailedToImport',
    name: 'Definition failed to import',
    description: 'The definition file failed to import',
    fields: {
        file: {
            type: 'text',
            label: 'File',
            isRequired: true,
            hint: 'The file definition file I tried to import',
        },
    },
})
