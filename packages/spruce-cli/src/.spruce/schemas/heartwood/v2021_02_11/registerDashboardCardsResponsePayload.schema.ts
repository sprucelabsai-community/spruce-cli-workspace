import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const registerDashboardCardsResponsePayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.RegisterDashboardCardsResponsePayloadSchema  = {
	id: 'registerDashboardCardsResponsePayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'vcIds': {
	                type: 'id',
	                isRequired: true,
	                isArray: true,
	                minArrayLength: 0,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(registerDashboardCardsResponsePayloadSchema)

export default registerDashboardCardsResponsePayloadSchema
