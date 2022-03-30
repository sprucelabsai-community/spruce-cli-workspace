import { buildEventContract } from '@sprucelabs/mercury-types'
import { buildPermissionContract } from '@sprucelabs/mercury-types'
import getSkillViewsEmitTargetAndPayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/getSkillViewsEmitTargetAndPayload.schema'
import getSkillViewsResponsePayloadSchema from '#spruce/schemas/heartwood/v2021_02_11/getSkillViewsResponsePayload.schema'

const getSkillViewsEventContract = buildEventContract({
	eventSignatures: {
		'heartwood.get-skill-views::v2021_02_11': {
			isGlobal: true,
			emitPayloadSchema: getSkillViewsEmitTargetAndPayloadSchema,
			responsePayloadSchema: getSkillViewsResponsePayloadSchema,
			emitPermissionContract: buildPermissionContract({
				id: 'getSkillViewsEmitPermissions',
				name: 'Get skill views',
				description: null,
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-get-skill-views',
						name: 'Can get skill views',
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
export default getSkillViewsEventContract

export type GetSkillViewsEventContract = typeof getSkillViewsEventContract
