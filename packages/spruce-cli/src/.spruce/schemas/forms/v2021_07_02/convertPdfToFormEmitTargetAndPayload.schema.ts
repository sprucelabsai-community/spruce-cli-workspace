import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import convertPdfToFormEmitPayloadSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/convertPdfToFormEmitPayload.schema'

const convertPdfToFormEmitTargetAndPayloadSchema: SpruceSchemas.Forms.v2021_07_02.ConvertPdfToFormEmitTargetAndPayloadSchema  = {
	id: 'convertPdfToFormEmitTargetAndPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'payload': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: convertPdfToFormEmitPayloadSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(convertPdfToFormEmitTargetAndPayloadSchema)

export default convertPdfToFormEmitTargetAndPayloadSchema
