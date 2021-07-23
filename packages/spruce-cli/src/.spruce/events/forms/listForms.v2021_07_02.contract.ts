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
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-list-forms',
						name: 'Can list forms',
						defaults: {
							loggedIn: {
								default: true,
							},
							anonymous: {
								default: true,
							},
							skill: true,
						},
					},
				],
			}),
			listenPermissionContract: buildPermissionContract({
				id: 'listFormsListenPermissions',
				name: 'list forms',
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-list-forms',
						name: 'Can list forms',
						defaults: {
							anonymous: {
								default: true,
							},
							loggedIn: {
								default: true,
							},
							skill: true,
						},
					},
				],
			}),
		},
	},
})
export default listFormsEventContract

export type ListFormsEventContract = typeof listFormsEventContract
