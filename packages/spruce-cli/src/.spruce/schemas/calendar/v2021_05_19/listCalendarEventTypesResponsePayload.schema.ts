import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import fullCalendarEventTypeSchema_v2021_05_19 from '#spruce/schemas/calendar/v2021_05_19/fullCalendarEventType.schema'

const listCalendarEventTypesResponsePayloadSchema: SpruceSchemas.Calendar.v2021_05_19.ListCalendarEventTypesResponsePayloadSchema  = {
	id: 'listCalendarEventTypesResponsePayload',
	version: 'v2021_05_19',
	namespace: 'Calendar',
	name: '',
	    fields: {
	            /** . */
	            'calendarEventTypes': {
	                type: 'schema',
	                isRequired: true,
	                isArray: true,
	                minArrayLength: 0,
	                options: {schema: fullCalendarEventTypeSchema_v2021_05_19,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(listCalendarEventTypesResponsePayloadSchema)

export default listCalendarEventTypesResponsePayloadSchema
