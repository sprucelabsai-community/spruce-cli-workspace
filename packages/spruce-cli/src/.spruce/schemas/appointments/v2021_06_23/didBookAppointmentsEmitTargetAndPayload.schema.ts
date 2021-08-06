import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import didBookAppointmentsEmitTargetSchema_v2021_06_23 from '#spruce/schemas/appointments/v2021_06_23/didBookAppointmentsEmitTarget.schema'
import didBookAppointmentsEmitPayloadSchema_v2021_06_23 from '#spruce/schemas/appointments/v2021_06_23/didBookAppointmentsEmitPayload.schema'

const didBookAppointmentsEmitTargetAndPayloadSchema: SpruceSchemas.Appointments.v2021_06_23.DidBookAppointmentsEmitTargetAndPayloadSchema  = {
	id: 'didBookAppointmentsEmitTargetAndPayload',
	version: 'v2021_06_23',
	namespace: 'Appointments',
	name: '',
	    fields: {
	            /** . */
	            'target': {
	                type: 'schema',
	                options: {schema: didBookAppointmentsEmitTargetSchema_v2021_06_23,}
	            },
	            /** . */
	            'payload': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: didBookAppointmentsEmitPayloadSchema_v2021_06_23,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(didBookAppointmentsEmitTargetAndPayloadSchema)

export default didBookAppointmentsEmitTargetAndPayloadSchema