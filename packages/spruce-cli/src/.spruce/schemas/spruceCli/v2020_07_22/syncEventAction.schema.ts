import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const syncEventActionSchema: SpruceSchemas.SpruceCli.v2020_07_22.SyncEventActionSchema  = {
	id: 'syncEventAction',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'sync event action',
	    fields: {
	            /** Contract destination. Where I will generate event contracts. */
	            'contractDestinationDir': {
	                label: 'Contract destination',
	                type: 'text',
	                hint: 'Where I will generate event contracts.',
	                defaultValue: "#spruce/events",
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(syncEventActionSchema)

export default syncEventActionSchema