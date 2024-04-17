import handlebars from 'handlebars'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'

/* The enum for schema.fields.fieldName.type as a string */
handlebars.registerHelper(
    'fieldTypeEnum',
    function (fieldDefinitions: FieldDefinitions) {
        if (!fieldDefinitions) {
            throw new Error(
                'fieldTypeEnum helper needs a FieldDefinitions as the first argument'
            )
        }

        const { type } = fieldDefinitions

        return `'${type}'`
    }
)
