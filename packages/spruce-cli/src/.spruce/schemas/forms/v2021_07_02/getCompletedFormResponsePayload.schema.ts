import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import getCompletedFormEventFormSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/getCompletedFormEventForm.schema'

const getCompletedFormResponsePayloadSchema: SpruceSchemas.Forms.v2021_07_02.GetCompletedFormResponsePayloadSchema  = {
	id: 'getCompletedFormResponsePayload',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'completedForm': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: getCompletedFormEventFormSchema_v2021_07_02,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(getCompletedFormResponsePayloadSchema)

export default getCompletedFormResponsePayloadSchema
