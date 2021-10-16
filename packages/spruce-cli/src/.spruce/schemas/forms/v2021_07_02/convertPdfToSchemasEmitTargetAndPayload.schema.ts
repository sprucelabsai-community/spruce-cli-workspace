import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import eventSourceSchema_v2021_09_13 from '#spruce/schemas/spruceEventUtils/v2021_09_13/eventSource.schema'
import convertPdfToSchemasEmitPayloadSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/convertPdfToSchemasEmitPayload.schema'

const convertPdfToSchemasEmitTargetAndPayloadSchema: SpruceSchemas.Forms.v2021_07_02.ConvertPdfToSchemasEmitTargetAndPayloadSchema  = {
	id: 'convertPdfToSchemasEmitTargetAndPayload',
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
	                options: {schema: convertPdfToSchemasEmitPayloadSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(convertPdfToSchemasEmitTargetAndPayloadSchema)

export default convertPdfToSchemasEmitTargetAndPayloadSchema
