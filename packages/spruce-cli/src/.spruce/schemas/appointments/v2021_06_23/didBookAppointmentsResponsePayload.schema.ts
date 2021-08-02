import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const didBookAppointmentsResponsePayloadSchema: SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsResponsePayloadSchema  = {
	id: 'didBookAppointmentsResponsePayload',
	version: 'v2021_06_23',
	namespace: 'Appointments',
	name: '',
	    fields: {
	            /** . */
	            'optionalField': {
	                type: 'text',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(didBookAppointmentsResponsePayloadSchema)

export default didBookAppointmentsResponsePayloadSchema
