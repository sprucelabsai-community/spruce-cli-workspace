import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const eventSourceSchema: SpruceSchemas.Heartwood.v2021_02_11.EventSourceSchema  = {
	id: 'eventSource',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** Proxy token. */
	            'proxyToken': {
	                label: 'Proxy token',
	                type: 'id',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(eventSourceSchema)

export default eventSourceSchema
