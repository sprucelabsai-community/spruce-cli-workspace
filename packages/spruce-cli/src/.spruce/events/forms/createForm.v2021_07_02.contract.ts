import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import createFormEmitTargetAndPayloadSchema from '#spruce/schemas/forms/v2021_07_02/createFormEmitTargetAndPayload.schema'
import createFormResponsePayloadSchema from '#spruce/schemas/forms/v2021_07_02/createFormResponsePayload.schema'

const createFormEventContract = buildEventContract({
	eventSignatures: {
		'forms.create-form::v2021_07_02': {
			isGlobal: true,
			emitPayloadSchema: createFormEmitTargetAndPayloadSchema,
			responsePayloadSchema: createFormResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'createFormEmitPermissions',
				name: 'Create Form',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-create-form',
						name: 'Can create form',
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
export default createFormEventContract

export type CreateFormEventContract = typeof createFormEventContract
