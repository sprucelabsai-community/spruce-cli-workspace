import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'

const myCoolEventEventContract = buildEventContract({
	eventSignatures: {
		'my-skill-1633628748543-25100.my-cool-event::v2021_01_22': {
			isGlobal: true,

			emitPermissionContract: buildPermissionContract({
				id: 'anon-can',
				name: 'can anon',
				description: null,
				requireAllPermissions: null,
				permissions: [
					{
						id: 'can-emit',
						name: 'can do it!',
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
							loggedIn: null,
						},
						can: null,
					},
				],
			}),
		},
	},
})
export default myCoolEventEventContract

export type MyCoolEventEventContract = typeof myCoolEventEventContract
