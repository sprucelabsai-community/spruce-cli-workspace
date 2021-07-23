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
				requireAllPermissions: false,
				permissions: [
					{
						name: 'Can generate  url',
						id: 'can-generate-url',
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
export default generateUrlEventContract

export type GenerateUrlEventContract = typeof generateUrlEventContract
