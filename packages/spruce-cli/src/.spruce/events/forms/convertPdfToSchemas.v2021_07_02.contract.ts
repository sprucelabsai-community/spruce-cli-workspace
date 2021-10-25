import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import convertPdfToSchemasEmitTargetAndPayloadSchema from '#spruce/schemas/forms/v2021_07_02/convertPdfToSchemasEmitTargetAndPayload.schema'
import convertPdfToSchemasResponsePayloadSchema from '#spruce/schemas/forms/v2021_07_02/convertPdfToSchemasResponsePayload.schema'

const convertPdfToSchemasEventContract = buildEventContract({
	eventSignatures: {
		'forms.convert-pdf-to-schemas::v2021_07_02': {
			isGlobal: true,
			emitPayloadSchema: convertPdfToSchemasEmitTargetAndPayloadSchema,
			responsePayloadSchema: convertPdfToSchemasResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'convertPdfToSchemasEmitPermissions',
				name: 'convert pdf to schemas',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-convert-pdf-to-schemas',
						name: 'Can convert pdf to schemas',
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
export default convertPdfToSchemasEventContract

export type ConvertPdfToSchemasEventContract =
	typeof convertPdfToSchemasEventContract
