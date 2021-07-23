import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import formBuilderImportExportObjectSchema_v2021_02_11 from '#spruce/schemas/heartwoodViewControllers/v2021_02_11/formBuilderImportExportObject.schema'

const convertPdfToFormResponsePayloadSchema: SpruceSchemas.Forms.v2021_07_02.ConvertPdfToFormResponsePayloadSchema  = {
	id: 'convertPdfToFormResponsePayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'form': {
	                type: 'schema',
	                options: {schema: formBuilderImportExportObjectSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(convertPdfToFormResponsePayloadSchema)

export default convertPdfToFormResponsePayloadSchema
