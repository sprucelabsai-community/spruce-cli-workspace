import { FieldDefinition } from '@sprucelabs/schema'
import handlebars from 'handlebars'

/* The enum for schema.fields.fieldName.type as a string */
handlebars.registerHelper('fieldTypeEnum', function (
	fieldDefinition: FieldDefinition
) {
	if (!fieldDefinition) {
		throw new Error(
			'fieldTypeEnum helper needs a FieldDefinition as the first argument'
		)
	}

	const { type } = fieldDefinition

	return `'${type}'`
})
