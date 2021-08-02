import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const getCompletedFormEmitTargetSchema: SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEmitTargetSchema  = {
	id: 'getCompletedFormEmitTarget',
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

SchemaRegistry.getInstance().trackSchema(getCompletedFormEmitTargetSchema)

export default getCompletedFormEmitTargetSchema
