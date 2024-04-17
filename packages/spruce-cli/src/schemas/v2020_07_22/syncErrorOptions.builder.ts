import { buildSchema, dropFields } from '@sprucelabs/schema'
import syncSchemasOptionsBuilder from './syncSchemasOptions.builder'

export default buildSchema({
    id: 'syncErrorOptions',
    name: 'Sync error action',
    description: 'Keep your errors types in sync with your builders',
    fields: {
        ...dropFields(syncSchemasOptionsBuilder.fields, [
            'deleteDestinationDirIfNoSchemas',
            'deleteOrphanedSchemas',
        ]),
        errorClassDestinationDir: {
            type: 'text',
            label: 'Error class destination',
            isRequired: true,
            isPrivate: true,
            hint: "Where I'll save your new Error class file?",
            defaultValue: 'src/errors',
        },
        errorLookupDir: {
            type: 'text',
            hint: 'Where I should look for your error builders?',
            defaultValue: 'src/errors',
        },
        errorTypesDestinationDir: {
            type: 'text',
            label: 'Types destination dir',
            hint: 'This is where error options and type information will be written',
            defaultValue: '#spruce/errors',
        },
    },
})
