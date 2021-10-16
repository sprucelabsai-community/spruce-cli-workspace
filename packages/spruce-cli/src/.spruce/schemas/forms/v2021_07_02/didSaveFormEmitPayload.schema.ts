import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const didSaveFormEmitPayloadSchema: SpruceSchemas.Forms.v2021_07_02.DidSaveFormEmitPayloadSchema  = {
	id: 'didSaveFormEmitPayload',
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

SchemaRegistry.getInstance().trackSchema(didSaveFormEmitPayloadSchema)

export default didSaveFormEmitPayloadSchema
