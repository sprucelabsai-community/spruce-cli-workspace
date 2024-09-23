import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const syncEventOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.SyncEventOptionsSchema  = {
	id: 'syncEventOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'sync event action',
	description: 'Pull down event contracts from Mercury to make them available in your skill.',
	    fields: {
	            /** Contract destination. Where I will generate event contracts. */
	            'contractDestinationDir': {
	                label: 'Contract destination',
	                type: 'text',
	                hint: 'Where I will generate event contracts.',
	                defaultValue: "#spruce/events",
	                options: undefined
	            },
	            /** Schema types lookup directory. Where I will lookup schema types and interfaces. */
	            'schemaTypesLookupDir': {
	                label: 'Schema types lookup directory',
	                type: 'text',
	                hint: 'Where I will lookup schema types and interfaces.',
	                defaultValue: "#spruce/schemas",
	                options: undefined
	            },
	            /** Sync only core events. For use in @sprucelabs/mercury-types */
	            'shouldSyncOnlyCoreEvents': {
	                label: 'Sync only core events',
	                type: 'boolean',
	                hint: 'For use in @sprucelabs/mercury-types',
	                options: undefined
	            },
	            /** Event signature types file. */
	            'skillEventContractTypesFile': {
	                label: 'Event signature types file',
	                type: 'text',
	                defaultValue: "@sprucelabs/mercury-types/build/types/mercury.types",
	                options: undefined
	            },
	            /** Event builder file. */
	            'eventBuilderFile': {
	                label: 'Event builder file',
	                type: 'text',
	                defaultValue: "@sprucelabs/mercury-types",
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(syncEventOptionsSchema)

export default syncEventOptionsSchema
