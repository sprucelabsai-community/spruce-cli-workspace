import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import listFormsFormSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/listFormsForm.schema'

const listFormsResponsePayloadSchema: SpruceSchemas.Forms.v2021_07_02.ListFormsResponsePayloadSchema  = {
	id: 'listFormsResponsePayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'forms': {
	                type: 'schema',
	                isRequired: true,
	                isArray: true,
	                minArrayLength: 0,
	                options: {schema: listFormsFormSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(listFormsResponsePayloadSchema)

export default listFormsResponsePayloadSchema
