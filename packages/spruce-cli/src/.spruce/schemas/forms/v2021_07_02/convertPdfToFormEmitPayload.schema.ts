import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const convertPdfToFormEmitPayloadSchema: SpruceSchemas.Forms.v2021_07_02.ConvertPdfToFormEmitPayloadSchema  = {
	id: 'convertPdfToFormEmitPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** Contents of PDF to convert to form. */
	            'pdfContents': {
	                label: 'Contents of PDF to convert to form',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(convertPdfToFormEmitPayloadSchema)

export default convertPdfToFormEmitPayloadSchema
