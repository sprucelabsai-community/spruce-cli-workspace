import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'schemaTemplateItemBuildingFailed',
    name: 'Schema template item building failed',
    description: '',
    fields: {
        schemaId: {
            type: 'text',
            isRequired: true,
        },
        schemaNamespace: {
            type: 'text',
            isRequired: true,
        },
        fieldName: {
            type: 'text',
            isRequired: true,
        },
        fieldOptions: {
            type: 'raw',
            isRequired: true,
            options: {
                valueType: 'Record<string, any>',
            },
        },
    },
})
