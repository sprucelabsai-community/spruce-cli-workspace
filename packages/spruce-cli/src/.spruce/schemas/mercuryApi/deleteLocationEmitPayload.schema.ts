import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../schemas.types'



const deleteLocationEmitPayloadSchema: SpruceSchemas.MercuryApi.DeleteLocationEmitPayloadSchema  = {
	id: 'deleteLocationEmitPayload',
	namespace: 'MercuryApi',
	name: '',
	    fields: {
	            /** . */
	            'id': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(deleteLocationEmitPayloadSchema)

export default deleteLocationEmitPayloadSchema