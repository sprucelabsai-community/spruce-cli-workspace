import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const deleteCompletedFormEmitTargetSchema: SpruceSchemas.Forms.v2021_07_02.DeleteCompletedFormEmitTargetSchema  = {
	id: 'deleteCompletedFormEmitTarget',
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

SchemaRegistry.getInstance().trackSchema(deleteCompletedFormEmitTargetSchema)

export default deleteCompletedFormEmitTargetSchema
