import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import getCompletedFormEmitTargetSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/getCompletedFormEmitTarget.schema'

const getCompletedFormEmitTargetAndPayloadSchema: SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEmitTargetAndPayloadSchema  = {
	id: 'getCompletedFormEmitTargetAndPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'target': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: getCompletedFormEmitTargetSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(getCompletedFormEmitTargetAndPayloadSchema)

export default getCompletedFormEmitTargetAndPayloadSchema
