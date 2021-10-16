import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import eventSourceSchema_v2021_09_13 from '#spruce/schemas/spruceEventUtils/v2021_09_13/eventSource.schema'
import didSaveFormEmitPayloadSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/didSaveFormEmitPayload.schema'

const didUpdateCompletedFormEmitTargetAndPayloadSchema: SpruceSchemas.Forms.v2021_07_02.DidUpdateCompletedFormEmitTargetAndPayloadSchema  = {
	id: 'didUpdateCompletedFormEmitTargetAndPayload',
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
	                options: {schema: didSaveFormEmitPayloadSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(didUpdateCompletedFormEmitTargetAndPayloadSchema)

export default didUpdateCompletedFormEmitTargetAndPayloadSchema
