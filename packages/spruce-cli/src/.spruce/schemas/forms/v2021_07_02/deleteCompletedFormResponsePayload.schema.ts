import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const deleteCompletedFormResponsePayloadSchema: SpruceSchemas.Forms.v2021_07_02.DeleteCompletedFormResponsePayloadSchema  = {
	id: 'deleteCompletedFormResponsePayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'totalDeleted': {
	                type: 'number',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(deleteCompletedFormResponsePayloadSchema)

export default deleteCompletedFormResponsePayloadSchema
