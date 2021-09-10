import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import eventSourceSchema_v2021_05_19 from '#spruce/schemas/calendar/v2021_05_19/eventSource.schema'

const fullCalendarEventTypeSchema: SpruceSchemas.Calendar.v2021_05_19.FullCalendarEventTypeSchema  = {
	id: 'fullCalendarEventType',
	version: 'v2021_05_19',
	namespace: 'Calendar',
	name: '',
	    fields: {
	            /** . */
	            'id': {
	                type: 'id',
	                options: undefined
	            },
	            /** . */
	            'name': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'slug': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'source': {
	                type: 'schema',
	                options: {schema: eventSourceSchema_v2021_05_19,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(fullCalendarEventTypeSchema)

export default fullCalendarEventTypeSchema
