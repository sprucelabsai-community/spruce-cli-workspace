import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const convertPdfToSchemasEmitPayloadSchema: SpruceSchemas.Forms.v2021_07_02.ConvertPdfToSchemasEmitPayloadSchema  = {
	id: 'convertPdfToSchemasEmitPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** Contents of PDF to convert to schemas. */
	            'pdfContents': {
	                label: 'Contents of PDF to convert to schemas',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(convertPdfToSchemasEmitPayloadSchema)

export default convertPdfToSchemasEmitPayloadSchema
