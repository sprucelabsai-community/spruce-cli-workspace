import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const createCalendarEventTypeEmitPayloadSchema: SpruceSchemas.Calendar.v2021_05_19.CreateCalendarEventTypeEmitPayloadSchema  = {
	id: 'createCalendarEventTypeEmitPayload',
	version: 'v2021_05_19',
	namespace: 'Calendar',
	name: '',
	    fields: {
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
	    }
}

SchemaRegistry.getInstance().trackSchema(createCalendarEventTypeEmitPayloadSchema)

export default createCalendarEventTypeEmitPayloadSchema
