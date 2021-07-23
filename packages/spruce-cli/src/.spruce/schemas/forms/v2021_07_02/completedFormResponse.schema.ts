import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const completedFormResponseSchema: SpruceSchemas.Forms.v2021_07_02.CompletedFormResponseSchema  = {
	id: 'completedFormResponse',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'personName': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'formTitle': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'completedFormBuilderId': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(completedFormResponseSchema)

export default completedFormResponseSchema
