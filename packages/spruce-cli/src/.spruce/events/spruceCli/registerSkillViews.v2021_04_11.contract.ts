import { buildEventContract } from '@sprucelabs/mercury-types'

const registerSkillViewsEventContract = buildEventContract({
	eventSignatures: {
		'spruce-cli.register-skill-views::v2021_04_11': {
			isGlobal: true,
		},
	},
})
export default registerSkillViewsEventContract

export type RegisterSkillViewsEventContract =
	typeof registerSkillViewsEventContract
