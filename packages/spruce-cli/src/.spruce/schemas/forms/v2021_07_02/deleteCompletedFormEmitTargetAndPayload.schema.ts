import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import deleteCompletedFormEmitTargetSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/deleteCompletedFormEmitTarget.schema'

const deleteCompletedFormEmitTargetAndPayloadSchema: SpruceSchemas.Forms.v2021_07_02.DeleteCompletedFormEmitTargetAndPayloadSchema  = {
	id: 'deleteCompletedFormEmitTargetAndPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'target': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: deleteCompletedFormEmitTargetSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(deleteCompletedFormEmitTargetAndPayloadSchema)

export default deleteCompletedFormEmitTargetAndPayloadSchema
