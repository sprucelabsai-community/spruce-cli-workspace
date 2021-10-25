import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import listFormsResponsePayloadSchema from '#spruce/schemas/forms/v2021_07_02/listFormsResponsePayload.schema'

const listFormsEventContract = buildEventContract({
	eventSignatures: {
		'forms.list-forms::v2021_07_02': {
			isGlobal: true,

			responsePayloadSchema: listFormsResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'listFormsEmitPermissions',
				name: 'list forms',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-list-forms',
						name: 'Can list forms',
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
			listenPermissionContract: buildPermissionContract({
				id: 'listFormsListenPermissions',
				name: 'list forms',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-list-forms',
						name: 'Can list forms',
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
export default listFormsEventContract

export type ListFormsEventContract = typeof listFormsEventContract
