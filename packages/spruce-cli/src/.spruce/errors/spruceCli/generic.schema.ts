import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const genericSchema: SpruceErrors.SpruceCli.GenericSchema  = {
	id: 'generic',
	namespace: 'SpruceCli',
	name: 'generic',
	description: 'When you\'re too lazy to make a new error',
	    fields: {
	            /** Friendly message. */
	            'friendlyMessageSet': {
	                label: 'Friendly message',
	                type: 'text',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(genericSchema)

export default genericSchema
