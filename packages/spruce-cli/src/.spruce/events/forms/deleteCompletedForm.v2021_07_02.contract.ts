import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import deleteCompletedFormEmitTargetAndPayloadSchema from '#spruce/schemas/forms/v2021_07_02/deleteCompletedFormEmitTargetAndPayload.schema'
import deleteCompletedFormResponsePayloadSchema from '#spruce/schemas/forms/v2021_07_02/deleteCompletedFormResponsePayload.schema'

const deleteCompletedFormEventContract = buildEventContract({
	eventSignatures: {
		'forms.delete-completed-form::v2021_07_02': {
			isGlobal: true,
			emitPayloadSchema: deleteCompletedFormEmitTargetAndPayloadSchema,
			responsePayloadSchema: deleteCompletedFormResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'deleteCompletedFormEmitPermissions',
				name: 'delete completed form',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-delete-completed-form',
						name: 'Can delete completed form',
						description: null,
						requireAllStatuses: null,
						defaults: {
							skill: null,
							owner: null,
							groupManager: null,
							manager: null,
							teammate: null,
							guest: null,
							anonymous: {
								default: true,
								clockedIn: null,
								clockedOut: null,
								onPrem: null,
								offPrem: null,
							},
							loggedIn: {
								default: true,
								clockedIn: null,
								clockedOut: null,
								onPrem: null,
								offPrem: null,
							},
						},
						can: null,
					},
				],
			}),
		},
	},
})
export default deleteCompletedFormEventContract

export type DeleteCompletedFormEventContract =
	typeof deleteCompletedFormEventContract
