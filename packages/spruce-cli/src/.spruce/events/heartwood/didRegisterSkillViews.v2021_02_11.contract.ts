import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import didRegisterSkillViewsEmitTargetAndPayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/didRegisterSkillViewsEmitTargetAndPayload.schema'

const didRegisterSkillViewsEventContract = buildEventContract({
	eventSignatures: {
		'heartwood.did-register-skill-views::v2021_02_11': {
			isGlobal: true,
			emitPayloadSchema: didRegisterSkillViewsEmitTargetAndPayloadSchema,

			listenPermissionContract: buildPermissionContract({
				id: 'didRegisterSkillViewsListenPermissions',
				name: 'did register skill views',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-listen-to-did-register-skill-views',
						name: 'Know when skill views are registered',
						description: null,
						requireAllStatuses: null,
						defaults: {
							skill: null,
							owner: null,
							groupManager: null,
							manager: null,
							teammate: null,
							anonymous: null,
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
export default didRegisterSkillViewsEventContract

export type DidRegisterSkillViewsEventContract =
	typeof didRegisterSkillViewsEventContract
