import { buildSchema } from '@sprucelabs/schema'
import syncSchemasOptionsBuilder from './syncSchemasOptions.builder'

export default buildSchema({
    id: 'syncEventOptions',
    name: 'sync event action',
    description:
        'Pull down event contracts from Mercury to make them available in your skill.',
    fields: {
        contractDestinationDir: {
            type: 'text',
            label: 'Contract destination',
            hint: 'Where I will generate event contracts.',
            defaultValue: '#spruce/events',
        },
        schemaTypesLookupDir: {
            type: 'text',
            label: 'Schema types lookup directory',
            hint: 'Where I will lookup schema types and interfaces.',
            defaultValue:
                syncSchemasOptionsBuilder.fields.schemaTypesDestinationDirOrFile
                    .defaultValue,
        },
        shouldSyncOnlyCoreEvents: {
            type: 'boolean',
            label: 'Sync only core events',
            hint: 'For use in @sprucelabs/mercury-types',
        },
        skillEventContractTypesFile: {
            type: 'text',
            label: 'Event signature types file',
            defaultValue: '@sprucelabs/mercury-types/build/types/mercury.types',
        },
        eventBuilderFile: {
            type: 'text',
            label: 'Event builder file',
            defaultValue: '@sprucelabs/mercury-types',
        },
    },
})
