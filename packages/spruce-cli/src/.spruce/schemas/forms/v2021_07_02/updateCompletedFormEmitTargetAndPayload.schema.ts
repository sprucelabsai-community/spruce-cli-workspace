import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import eventSourceSchema_v2021_09_13 from '#spruce/schemas/spruceEventUtils/v2021_09_13/eventSource.schema'
import updateCompletedFormEmitPayloadSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/updateCompletedFormEmitPayload.schema'

const updateCompletedFormEmitTargetAndPayloadSchema: SpruceSchemas.Forms.v2021_07_02.UpdateCompletedFormEmitTargetAndPayloadSchema  = {
	id: 'updateCompletedFormEmitTargetAndPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** Source. */
	            'source': {
	                label: 'Source',
	                type: 'schema',
	                options: {schema: eventSourceSchema_v2021_09_13,}
	            },
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
