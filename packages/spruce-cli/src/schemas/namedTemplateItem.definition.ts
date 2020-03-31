import { buildSchemaDefinition, FieldType } from '@sprucelabs/schema'

const namedTemplateItemDefinition = buildSchemaDefinition({
	id: 'namedTemplateItem',
	name: 'NamedTemplateItem',
	description: 'Used to collect input on the names of a class or interface',
	fields: {
		readableName: {
			type: FieldType.Text,
			label: 'Readable name',
			isRequired: true,
			hint: 'The name people will read'
		},
		camelName: {
			type: FieldType.Text,
			label: 'Camel case name',
			isRequired: true,
			hint: 'camelCase version of the name'
		},
		pascalName: {
			type: FieldType.Text,
			label: 'Pascal case name',
			isRequired: true,
			hint: 'PascalCase of the name'
		},
		constName: {
			type: FieldType.Text,
			label: 'Constant case name',
			isRequired: true,
			hint: 'CONST_CASE of the name'
		},
		description: {
			type: FieldType.Text,
			isRequired: true,
			label: 'Description',
			description: 'Describe a bit more here'
		}
	}
})

export default namedTemplateItemDefinition
