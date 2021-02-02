import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
	id: 'deployFailed',
	name: 'Deploy Failed',
	description: '',
	fields: {
		stage: {
			type: 'select',
			isRequired: true,
			options: {
				choices: [
					{
						label: 'Building',
						value: 'building',
					},
					{
						label: 'Testing',
						value: 'testing',
					},
				],
			},
		},
	},
})
