import { buildSchema } from '@sprucelabs/schema'

export default buildSchema({
	id: 'nodeFeatureOptions',
	name: 'Create node module',
	description:
		'Create a new node module, to be written in typescript, ready to rock!',
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
