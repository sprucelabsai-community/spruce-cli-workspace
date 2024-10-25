import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const schemaExistsSchema: SpruceErrors.SpruceCli.SchemaExistsSchema  = {
	id: 'schemaExists',
	namespace: 'SpruceCli',
	name: 'Schema exists',
	    fields: {
	            /** Schema id. */
	            'schemaId': {
	                label: 'Schema id',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** Destination. */
	            'destination': {
	                label: 'Destination',
	                type: 'text',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(schemaExistsSchema)

export default schemaExistsSchema
