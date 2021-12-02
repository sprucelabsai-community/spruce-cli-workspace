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
				requireAllPermissions: false,
				permissions: [
					{
						id: 'can-get-skill-views',
						name: 'Can get skill views',
						defaults: {
							anonymous: {
								default: true,
							},
							loggedIn: {
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
export default getSkillViewsEventContract

export type GetSkillViewsEventContract = typeof getSkillViewsEventContract
