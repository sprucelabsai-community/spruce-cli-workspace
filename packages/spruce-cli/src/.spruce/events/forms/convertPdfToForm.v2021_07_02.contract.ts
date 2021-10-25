import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import convertPdfToFormEmitTargetAndPayloadSchema from '#spruce/schemas/forms/v2021_07_02/convertPdfToFormEmitTargetAndPayload.schema'
import convertPdfToFormResponsePayloadSchema from '#spruce/schemas/forms/v2021_07_02/convertPdfToFormResponsePayload.schema'

const convertPdfToFormEventContract = buildEventContract({
	eventSignatures: {
		'forms.convert-pdf-to-form::v2021_07_02': {
			isGlobal: true,
			emitPayloadSchema: convertPdfToFormEmitTargetAndPayloadSchema,
			responsePayloadSchema: convertPdfToFormResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'convertPdfToFormEmitPermissions',
				name: 'Convert Pdf to Form',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-convert-pdf-to-form',
						name: 'Can convert pdf to form',
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
export default convertPdfToFormEventContract

export type ConvertPdfToFormEventContract = typeof convertPdfToFormEventContract
