import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const registerSkillViewsResponsePayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsResponsePayloadSchema  = {
	id: 'registerSkillViewsResponsePayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . Views that were registered. Will match the number of ids you sent. */
	            'totalRegistered': {
	                type: 'number',
	                isRequired: true,
	                hint: 'Views that were registered. Will match the number of ids you sent.',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(registerSkillViewsResponsePayloadSchema)

export default registerSkillViewsResponsePayloadSchema
