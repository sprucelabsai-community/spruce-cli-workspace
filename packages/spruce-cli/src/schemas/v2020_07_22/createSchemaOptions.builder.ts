import { buildSchema } from '@sprucelabs/schema'
import namedTemplateItemBuilder from './namedTemplateItem.builder'
import syncSchemasOptionsBuilder from './syncSchemasOptions.builder'

export default buildSchema({
    id: 'createSchemaOptions',
    name: 'Create schema',
    description: 'Create the builder to a fresh new schema!',
    fields: {
        ...syncSchemasOptionsBuilder.fields,
        schemaBuilderDestinationDir: {
            type: 'text',
            label: 'Schema builder destination directory',
            hint: "Where I'll save the new schema builder.",
            defaultValue: 'src/schemas',
        },
        builderFunction: {
            type: 'text',
            label: 'Builder function',
            hint: 'The function that builds this schema',
            defaultValue: 'buildSchema',
            isPrivate: true,
        },
        moduleToImportFromWhenRemote: {
            type: 'text',
            label: 'Source module',
            hint: 'If this schema should be imported from a node module vs generated locally.',
        },
        syncAfterCreate: {
            type: 'boolean',
            label: 'Sync after creation',
            hint: 'This will ensure types and schemas are in sync after you create your builder.',
            isPrivate: true,
            defaultValue: true,
        },
        version: {
            type: 'text',
            label: 'Version',
            hint: 'Set a version yourself instead of letting me generate one for you',
            isPrivate: true,
        },
        nameReadable: namedTemplateItemBuilder.fields.nameReadable,
        namePascal: namedTemplateItemBuilder.fields.namePascal,
        nameCamel: namedTemplateItemBuilder.fields.nameCamel,
        description: namedTemplateItemBuilder.fields.description,
    },
})
