import { buildSchema } from '@sprucelabs/schema'
import namedTemplateItemBuilder from './namedTemplateItem.builder'

export default buildSchema({
	id: 'createTestOptions',
	name: 'Create test action',
	description: 'Your first failing test just a command away! ⚔️',
	fields: {
		type: {
			type: 'select',
			label: 'Type of test',
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
			hint: 'E.g. Todo Card or Systems List',
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
