import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import updateCompletedFormEmitPayloadSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/updateCompletedFormEmitPayload.schema'

const updateCompletedFormEmitTargetAndPayloadSchema: SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormEmitTargetAndPayloadSchema  = {
	id: 'updateCompletedFormEmitTargetAndPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'payload': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: updateCompletedFormEmitPayloadSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(updateCompletedFormEmitTargetAndPayloadSchema)

export default updateCompletedFormEmitTargetAndPayloadSchema
