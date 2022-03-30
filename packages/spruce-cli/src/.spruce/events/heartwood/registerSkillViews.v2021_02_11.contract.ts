import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import registerSkillViewsEmitTargetAndPayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/registerSkillViewsEmitTargetAndPayload.schema'
import registerSkillViewsResponsePayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/registerSkillViewsResponsePayload.schema'

const registerSkillViewsEventContract = buildEventContract({
	eventSignatures: {
		'heartwood.register-skill-views::v2021_02_11': {
			isGlobal: true,
			emitPayloadSchema: registerSkillViewsEmitTargetAndPayloadSchema,
			responsePayloadSchema: registerSkillViewsResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'registerSkillViewsEmitPermissions',
				name: 'Register skill views',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-register-skill-views',
						name: 'Can register skill views',
						description: null,
						requireAllStatuses: null,
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
export default registerSkillViewsEventContract

export type RegisterSkillViewsEventContract =
	typeof registerSkillViewsEventContract
