import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const invalidFeatureCodeSchema: SpruceErrors.SpruceCli.InvalidFeatureCodeSchema  = {
	id: 'invalidFeatureCode',
	namespace: 'SpruceCli',
	name: 'Invalid feature code',
	    fields: {
	            /** . */
	            'featureCode': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(invalidFeatureCodeSchema)

export default invalidFeatureCodeSchema
