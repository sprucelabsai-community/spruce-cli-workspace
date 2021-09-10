import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
	id: 'nodeFeatureOptions',
	name: 'Node feature options',
	fields: {
		destination: {
			type: 'text',
			defaultValue: '.',
		},
		name: {
			type: 'text',
			isRequired: true,
			label: "What's the name of your module?",
		},
		description: {
			type: 'text',
			isRequired: true,
			label: 'How would you describe your module?',
		},
	},
})
