import { buildEventContract } from '@sprucelabs/mercury-types'
import listCalendarEventTypesResponsePayloadSchema from '#spruce/schemas/calendar/v2021_05_19/listCalendarEventTypesResponsePayload.schema'

const listCalendarEventTypesEventContract = buildEventContract({
	eventSignatures: {
		'calendar.list-calendar-event-types::v2021_05_19': {
			isGlobal: true,

			responsePayloadSchema: listCalendarEventTypesResponsePayloadSchema,
		},
	},
})
export default listCalendarEventTypesEventContract

export type ListCalendarEventTypesEventContract =
	typeof listCalendarEventTypesEventContract
