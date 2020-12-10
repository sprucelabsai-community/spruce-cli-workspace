import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../schemas.types'



const unRegisterEventsEmitPayloadSchema: SpruceSchemas.MercuryApi.UnRegisterEventsEmitPayloadSchema  = {
	id: 'unRegisterEventsEmitPayload',
	namespace: 'MercuryApi',
	name: '',
	    fields: {
	            /** . */
	            'eventNamesWithOptionalNamespace': {
	                type: 'text',
	                isRequired: true,
	                isArray: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(unRegisterEventsEmitPayloadSchema)

export default unRegisterEventsEmitPayloadSchema