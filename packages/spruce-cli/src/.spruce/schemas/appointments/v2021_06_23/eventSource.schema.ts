import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const eventSourceSchema: SpruceSchemas.Appointments.v2021_06_23.EventSourceSchema  = {
	id: 'eventSource',
	version: 'v2021_06_23',
	namespace: 'Appointments',
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
