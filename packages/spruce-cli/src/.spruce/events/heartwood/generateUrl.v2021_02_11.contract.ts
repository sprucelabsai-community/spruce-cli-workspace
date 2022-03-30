import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import generateUrlEmitTargetAndPayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/generateUrlEmitTargetAndPayload.schema'
import generateUrlResponsePayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/generateUrlResponsePayload.schema'

const generateUrlEventContract = buildEventContract({
	eventSignatures: {
		'heartwood.generate-url::v2021_02_11': {
			isGlobal: true,
			emitPayloadSchema: generateUrlEmitTargetAndPayloadSchema,
			responsePayloadSchema: generateUrlResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'generateUrlEmitPermissions',
				name: 'Generate url',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-generate-url',
						name: 'Can generate  url',
						description: null,
						requireAllStatuses: null,
						defaults: {
							skill: true,
							owner: null,
							groupManager: null,
							manager: null,
							teammate: null,
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
							guest: null,
						},
						can: null,
					},
				],
			}),
		},
	},
})
export default generateUrlEventContract

export type GenerateUrlEventContract = typeof generateUrlEventContract
