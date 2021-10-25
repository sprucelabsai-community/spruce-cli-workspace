import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import getCompletedFormEmitTargetAndPayloadSchema from '#spruce/schemas/forms/v2021_07_02/getCompletedFormEmitTargetAndPayload.schema'
import getCompletedFormResponsePayloadSchema from '#spruce/schemas/forms/v2021_07_02/getCompletedFormResponsePayload.schema'

const getCompletedFormEventContract = buildEventContract({
	eventSignatures: {
		'forms.get-completed-form::v2021_07_02': {
			isGlobal: true,
			emitPayloadSchema: getCompletedFormEmitTargetAndPayloadSchema,
			responsePayloadSchema: getCompletedFormResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'getCompletedFormEmitPermissions',
				name: 'Get completed form',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-get-completed-form',
						name: 'Can get completed form',
						description: null,
						requireAllStatuses: null,
						defaults: {
							skill: null,
							owner: null,
							groupManager: null,
							manager: null,
							teammate: null,
							guest: null,
							anonymous: null,
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
export default getCompletedFormEventContract

export type GetCompletedFormEventContract = typeof getCompletedFormEventContract
