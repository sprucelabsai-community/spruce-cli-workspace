import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import eventSourceSchema_v2021_09_13 from '#spruce/schemas/spruceEventUtils/v2021_09_13/eventSource.schema'
import generateUrlEmitTargetSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/generateUrlEmitTarget.schema'
import generateUrlEmitPayloadSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/generateUrlEmitPayload.schema'

const generateUrlEmitTargetAndPayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitTargetAndPayloadSchema  = {
	id: 'generateUrlEmitTargetAndPayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** Source. */
	            'source': {
	                label: 'Source',
	                type: 'schema',
	                options: {schema: eventSourceSchema_v2021_09_13,}
	            },
	            /** . */
	            'target': {
	                type: 'schema',
	                options: {schema: generateUrlEmitTargetSchema_v2021_02_11,}
	            },
	            /** . */
	            'payload': {
	                type: 'schema',
	                options: {schema: generateUrlEmitPayloadSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(generateUrlEmitTargetAndPayloadSchema)

export default generateUrlEmitTargetAndPayloadSchema
