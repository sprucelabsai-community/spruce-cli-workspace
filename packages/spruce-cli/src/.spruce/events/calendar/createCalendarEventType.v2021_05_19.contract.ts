import { buildEventContract } from '@sprucelabs/mercury-types'
import createCalendarEventTypeEmitTargetAndPayloadSchema from '#spruce/schemas/calendar/v2021_05_19/createCalendarEventTypeEmitTargetAndPayload.schema'
import createCalendarEventTypeResponsePayloadSchema from '#spruce/schemas/calendar/v2021_05_19/createCalendarEventTypeResponsePayload.schema'

const createCalendarEventTypeEventContract = buildEventContract({
	eventSignatures: {
		'calendar.create-calendar-event-type::v2021_05_19': {
			isGlobal: true,
			emitPayloadSchema: createCalendarEventTypeEmitTargetAndPayloadSchema,
			responsePayloadSchema: createCalendarEventTypeResponsePayloadSchema,
		},
	},
})
export default createCalendarEventTypeEventContract

export type CreateCalendarEventTypeEventContract =
	typeof createCalendarEventTypeEventContract
