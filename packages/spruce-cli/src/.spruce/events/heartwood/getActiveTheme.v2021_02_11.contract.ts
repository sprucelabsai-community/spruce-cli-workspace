import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import getActiveThemeEmitTargetAndPayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/getActiveThemeEmitTargetAndPayload.schema'
import getActiveThemeResponsePayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/getActiveThemeResponsePayload.schema'

const getActiveThemeEventContract = buildEventContract({
	eventSignatures: {
		'heartwood.get-active-theme::v2021_02_11': {
			isGlobal: true,
			emitPayloadSchema: getActiveThemeEmitTargetAndPayloadSchema,
			responsePayloadSchema: getActiveThemeResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'getActiveThemeEmitPermissions',
				name: 'Get active theme',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-get-active-theme',
						name: 'Can get active theme',
						description: null,
						requireAllStatuses: false,
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
export default getActiveThemeEventContract

export type GetActiveThemeEventContract = typeof getActiveThemeEventContract
