import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import listCompletedFormsResponsePayloadSchema from '#spruce/schemas/forms/v2021_07_02/listCompletedFormsResponsePayload.schema'

const listCompletedFormsEventContract = buildEventContract({
	eventSignatures: {
		'forms.list-completed-forms::v2021_07_02': {
			isGlobal: true,

			responsePayloadSchema: listCompletedFormsResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'listCompletedFormsEmitPermissions',
				name: 'list completed forms',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-list-completed-forms',
						name: 'Can list completed forms',
						description: null,
						requireAllStatuses: null,
						defaults: {
							skill: true,
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
export default listCompletedFormsEventContract

export type ListCompletedFormsEventContract =
	typeof listCompletedFormsEventContract
