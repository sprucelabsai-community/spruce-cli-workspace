import { buildEventContract } from '@sprucelabs/mercury-types'
import updateCompletedFormEmitTargetAndPayloadSchema from '#spruce/schemas/forms/v2021_07_02/updateCompletedFormEmitTargetAndPayload.schema'
import updateCompletedFormResponsePayloadSchema from '#spruce/schemas/forms/v2021_07_02/updateCompletedFormResponsePayload.schema'

const updateCompletedFormEventContract = buildEventContract({
	eventSignatures: {
		'forms.update-completed-form::v2021_07_02': {
			isGlobal: true,
			emitPayloadSchema: updateCompletedFormEmitTargetAndPayloadSchema,
			responsePayloadSchema: updateCompletedFormResponsePayloadSchema,
		},
	},
})
export default updateCompletedFormEventContract

export type UpdateCompletedFormEventContract =
	typeof updateCompletedFormEventContract
