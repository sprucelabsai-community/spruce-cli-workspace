import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import completedFormResponseSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/completedFormResponse.schema'

const listCompletedFormsResponsePayloadSchema: SpruceSchemas.Forms.v2021_07_02.ListCompletedFormsResponsePayloadSchema  = {
	id: 'listCompletedFormsResponsePayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'completedForms': {
	                type: 'schema',
	                isRequired: true,
	                isArray: true,
	                minArrayLength: 0,
	                options: {schema: completedFormResponseSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(listCompletedFormsResponsePayloadSchema)

export default listCompletedFormsResponsePayloadSchema
