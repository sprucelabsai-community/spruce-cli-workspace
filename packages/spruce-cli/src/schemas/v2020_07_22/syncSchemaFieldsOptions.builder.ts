import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
    id: 'syncSchemaFieldsOptions',
    name: 'syncSchemaFieldsOptions',
    description: 'Sync schema fields so you can use schemas!',
    fields: {
        fieldTypesDestinationDir: {
            type: 'text',
            label: 'Field types directory',
            hint: 'Where field types and interfaces will be generated.',
            defaultValue: '#spruce/schemas',
            isPrivate: true,
        },
        addonsLookupDir: {
            type: 'text',
            label: 'Addons lookup directory',
            hint: "Where I'll look for new schema fields to be registered.",
            defaultValue: 'src/addons',
        },
        generateFieldTypes: {
            type: 'boolean',
            label: 'Generate field types',
            isPrivate: true,
            hint: 'Should I generate field types too?',
            defaultValue: true,
        },
    },
})
