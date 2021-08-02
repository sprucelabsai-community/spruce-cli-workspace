import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import builtFormSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/builtForm.schema'

const createFormResponsePayloadSchema: SpruceSchemas.Forms.v2021_07_02.CreateFormResponsePayloadSchema  = {
	id: 'createFormResponsePayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'form': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: builtFormSchema_v2021_07_02,}
	            },
	            /** . */
	            'values': {
	                type: 'raw',
	                isArray: true,
	                options: {valueType: `Record<string, any>`,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(createFormResponsePayloadSchema)

export default createFormResponsePayloadSchema
