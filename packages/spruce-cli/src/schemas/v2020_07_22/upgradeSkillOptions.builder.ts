import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
	id: 'upgradeSkillOptions',
	name: 'Upgrade skill action',
	description: 'Upgrade. Everything. Heads up, this can take a few minutes. ⏱',
	fields: {
		upgradeMode: {
			type: 'select',
			label: 'Upgrade mode',
			defaultValue: 'askForChanged',
			options: {
				choices: [
					{
						value: 'askForChanged',
						label: 'Ask for changed files',
					},
					{
						value: 'forceEverything',
						label: 'Force everything',
					},
					{
						value: 'forceRequiredSkipRest',
						label: 'Force required (skipping all non-essential)',
					},
				],
			},
		},
	},
})
