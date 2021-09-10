import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import fullCalendarEventTypeSchema_v2021_05_19 from '#spruce/schemas/calendar/v2021_05_19/fullCalendarEventType.schema'

const createCalendarEventTypeResponsePayloadSchema: SpruceSchemas.Calendar.v2021_05_19.CreateCalendarEventTypeResponsePayloadSchema  = {
	id: 'createCalendarEventTypeResponsePayload',
	version: 'v2021_05_19',
	namespace: 'Calendar',
	name: '',
	    fields: {
	            /** . */
	            'calendarEventType': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: fullCalendarEventTypeSchema_v2021_05_19,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(createCalendarEventTypeResponsePayloadSchema)

export default createCalendarEventTypeResponsePayloadSchema
