import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const updateCompletedFormEmitPayloadSchema: SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormEmitPayloadSchema  = {
	id: 'updateCompletedFormEmitPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'sourceFormId': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'values': {
	                type: 'raw',
	                isArray: true,
	                options: {valueType: `Record<string, any>`,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(updateCompletedFormEmitPayloadSchema)

export default updateCompletedFormEmitPayloadSchema
