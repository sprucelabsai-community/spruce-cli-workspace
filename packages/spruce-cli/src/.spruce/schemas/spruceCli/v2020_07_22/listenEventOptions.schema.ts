import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

const listenEventOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.ListenEventOptionsSchema =
    {
        id: 'listenEventOptions',
        version: 'v2020_07_22',
        namespace: 'SpruceCli',
        name: 'Listen to event action',
        description: 'Options for event.listen.',
        fields: {
            /** Contract destination. Where I will generate event contracts. */
            contractDestinationDir: {
                label: 'Contract destination',
                type: 'text',
                hint: 'Where I will generate event contracts.',
                defaultValue: '#spruce/events',
                options: undefined,
            },
            /** Schema types lookup directory. Where I will lookup schema types and interfaces. */
            schemaTypesLookupDir: {
                label: 'Schema types lookup directory',
                type: 'text',
                hint: 'Where I will lookup schema types and interfaces.',
                defaultValue: '#spruce/schemas',
                options: undefined,
            },
            /** Sync only core events. For use in @sprucelabs/mercury-types */
            shouldSyncOnlyCoreEvents: {
                label: 'Sync only core events',
                type: 'boolean',
                hint: 'For use in @sprucelabs/mercury-types',
                options: undefined,
            },
            /** Event signature types file. */
            skillEventContractTypesFile: {
                label: 'Event signature types file',
                type: 'text',
                defaultValue:
                    '@sprucelabs/mercury-types/build/types/mercury.types',
                options: undefined,
            },
            /** Event builder file. */
            eventBuilderFile: {
                label: 'Event builder file',
                type: 'text',
                defaultValue: '@sprucelabs/mercury-types',
                options: undefined,
            },
            /** Namespace. */
            namespace: {
                label: 'Namespace',
                type: 'text',
                options: undefined,
            },
            /** Event name. */
            eventName: {
                label: 'Event name',
                type: 'text',
                options: undefined,
            },
            /** Events destination directory. Where should I add your listeners? */
            listenerDestinationDir: {
                label: 'Events destination directory',
                type: 'text',
                hint: 'Where should I add your listeners?',
                defaultValue: 'src/listeners',
                options: undefined,
            },
            /** Version. Set a version yourself instead of letting me generate one for you */
            version: {
                label: 'Version',
                type: 'text',
                isPrivate: true,
                hint: 'Set a version yourself instead of letting me generate one for you',
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(listenEventOptionsSchema)

export default listenEventOptionsSchema
