import { buildSchema } from '@sprucelabs/schema'
import namedTemplateItemBuilder from './namedTemplateItem.builder'

export default buildSchema({
	id: 'createTestAction',
	name: 'Create test action',
	description: 'Options for creating a new test.',
	fields: {
		type: {
			type: 'select',
			label: 'Type',
			isRequired: true,
			options: {
				choices: [
					{ value: 'behavioral', label: 'Behavioral' },
					{ value: 'implementation', label: 'Implementation' },
				],
			},
		},
		nameReadable: {
			type: 'text',
			label: 'What are you testing?',
			isRequired: true,
			hint: 'E.g. Booking an appointment or turning on a light',
		},
		testDestinationDir: {
			type: 'text',
			label: 'Test destination directory',
			hint: "Where I'll save your new test.",
			defaultValue: 'src/__tests__',
		},
		nameCamel: namedTemplateItemBuilder.fields.nameCamel,
		namePascal: namedTemplateItemBuilder.fields.namePascal,
	},
})
