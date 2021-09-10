import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import eventSourceSchema_v2021_05_19 from '#spruce/schemas/calendar/v2021_05_19/eventSource.schema'
import createCalendarEventTypeEmitPayloadSchema_v2021_05_19 from '#spruce/schemas/calendar/v2021_05_19/createCalendarEventTypeEmitPayload.schema'

const createCalendarEventTypeEmitTargetAndPayloadSchema: SpruceSchemas.Calendar.v2021_05_19.CreateCalendarEventTypeEmitTargetAndPayloadSchema  = {
	id: 'createCalendarEventTypeEmitTargetAndPayload',
	version: 'v2021_05_19',
	namespace: 'Calendar',
	name: '',
	    fields: {
	            /** Source. */
	            'source': {
	                label: 'Source',
	                type: 'schema',
	                options: {schema: eventSourceSchema_v2021_05_19,}
	            },
	            /** . */
	            'payload': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: createCalendarEventTypeEmitPayloadSchema_v2021_05_19,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(createCalendarEventTypeEmitTargetAndPayloadSchema)

export default createCalendarEventTypeEmitTargetAndPayloadSchema
