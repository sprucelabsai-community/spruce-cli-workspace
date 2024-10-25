import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const invalidEventContractSchema: SpruceErrors.SpruceCli.InvalidEventContractSchema  = {
	id: 'invalidEventContract',
	namespace: 'SpruceCli',
	name: 'invalid event contract',
	    fields: {
	            /** . */
	            'fullyQualifiedEventName': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'brokenProperty': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(invalidEventContractSchema)

export default invalidEventContractSchema
