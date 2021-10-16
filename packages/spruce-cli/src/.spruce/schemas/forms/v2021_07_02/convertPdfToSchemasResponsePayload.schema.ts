import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const convertPdfToSchemasResponsePayloadSchema: SpruceSchemas.Forms.v2021_07_02.ConvertPdfToSchemasResponsePayloadSchema  = {
	id: 'convertPdfToSchemasResponsePayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** Schemas genenerated for PDF. */
	            'schemas': {
	                label: 'Schemas genenerated for PDF',
	                type: 'raw',
	                isRequired: true,
	                isArray: true,
	                options: {valueType: `SpruceSchema.Schema`,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(convertPdfToSchemasResponsePayloadSchema)

export default convertPdfToSchemasResponsePayloadSchema
