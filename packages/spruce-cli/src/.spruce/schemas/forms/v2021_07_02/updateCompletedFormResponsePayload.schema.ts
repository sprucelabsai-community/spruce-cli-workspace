import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const updateCompletedFormResponsePayloadSchema: SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormResponsePayloadSchema  = {
	id: 'updateCompletedFormResponsePayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'completedFormId': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(updateCompletedFormResponsePayloadSchema)

export default updateCompletedFormResponsePayloadSchema
