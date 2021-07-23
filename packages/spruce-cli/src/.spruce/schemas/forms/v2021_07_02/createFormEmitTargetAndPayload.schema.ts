import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import createBuiltFormSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/createBuiltForm.schema'

const createFormEmitTargetAndPayloadSchema: SpruceSchemas.Forms.v2021_07_02.CreateFormEmitTargetAndPayloadSchema  = {
	id: 'createFormEmitTargetAndPayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'payload': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: createBuiltFormSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(createFormEmitTargetAndPayloadSchema)

export default createFormEmitTargetAndPayloadSchema
