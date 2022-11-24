import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import upsertThemeEmitTargetAndPayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/upsertThemeEmitTargetAndPayload.schema'
import upsertThemeResponsePayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/upsertThemeResponsePayload.schema'

const upsertThemeEventContract = buildEventContract({
	eventSignatures: {
		'heartwood.upsert-theme::v2021_02_11': {
			isGlobal: true,
			emitPayloadSchema: upsertThemeEmitTargetAndPayloadSchema,
			responsePayloadSchema: upsertThemeResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'upsertThemeEmitPermissions',
				name: 'upsert theme',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-manage-organization-themes',
						name: 'Can manage org themes',
						description: null,
						requireAllStatuses: false,
						defaults: {
							skill: true,
							owner: {
								default: true,
								clockedIn: null,
								clockedOut: null,
								onPrem: null,
								offPrem: null,
							},
							groupManager: null,
							manager: null,
							teammate: null,
							anonymous: null,
							loggedIn: null,
							guest: null,
						},
						can: null,
					},
				],
			}),
		},
	},
})
export default upsertThemeEventContract

export type UpsertThemeEventContract = typeof upsertThemeEventContract
