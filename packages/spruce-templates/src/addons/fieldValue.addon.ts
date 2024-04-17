import handlebars from 'handlebars'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'

/** Drop in the value of a field which quotes if needed */
handlebars.registerHelper(
    'fieldValue',
    function (fieldDefinitions: FieldDefinitions, value: any) {
        if (value) {
            throw new Error('field value not yet implemented')
        }

        return value
    }
)
