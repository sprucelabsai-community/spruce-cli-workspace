import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import registerDashboardCardsResponsePayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/registerDashboardCardsResponsePayload.schema'

const registerDashboardCardsEventContract = buildEventContract({
	eventSignatures: {
		'heartwood.register-dashboard-cards::v2021_02_11': {
			isGlobal: true,

			responsePayloadSchema: registerDashboardCardsResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'registerDashboardCardsEmitPermissions',
				name: 'register dashboard cards',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-get-dashboard-cards',
						name: 'Can get dashboard cards',
						description: 'Can get dashboard cards',
						requireAllStatuses: false,
						defaults: {
							skill: null,
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
			listenPermissionContract: buildPermissionContract({
				id: 'registerDashboardCardsListenPermissions',
				name: 'register dashboard cards',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-register-dashboard-cards',
						name: 'Can register dashboard cards',
						description: null,
						requireAllStatuses: false,
						defaults: {
							skill: true,
							owner: null,
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
export default registerDashboardCardsEventContract

export type RegisterDashboardCardsEventContract =
	typeof registerDashboardCardsEventContract
