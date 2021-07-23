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
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-list-completed-forms',
						name: 'Can list completed forms',
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
		},
	},
})
export default listCompletedFormsEventContract

export type ListCompletedFormsEventContract =
	typeof listCompletedFormsEventContract
