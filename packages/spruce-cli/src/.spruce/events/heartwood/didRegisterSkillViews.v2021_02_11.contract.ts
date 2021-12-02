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
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-listen-to-did-register-skill-views',
						name: 'Know when skill views are registered',
						defaults: {
							loggedIn: {
								default: true,
							},
						},
					},
				],
			}),
		},
	},
})
export default didRegisterSkillViewsEventContract

export type DidRegisterSkillViewsEventContract =
	typeof didRegisterSkillViewsEventContract
