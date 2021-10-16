import { buildEventContract } from '@sprucelabs/mercury-types'
import didUpdateCompletedFormEmitTargetAndPayloadSchema from '#spruce/schemas/forms/v2021_07_02/didUpdateCompletedFormEmitTargetAndPayload.schema'

const didUpdateCompletedFormEventContract = buildEventContract({
	eventSignatures: {
		'forms.did-update-completed-form::v2021_07_02': {
			isGlobal: true,
			emitPayloadSchema: didUpdateCompletedFormEmitTargetAndPayloadSchema,
		},
	},
})
export default didUpdateCompletedFormEventContract

export type DidUpdateCompletedFormEventContract =
	typeof didUpdateCompletedFormEventContract
