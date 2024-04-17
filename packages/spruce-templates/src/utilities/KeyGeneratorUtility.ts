import { TemplateRenderAs } from '@sprucelabs/schema'
import sha1 from 'sha1'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'

export default class KeyGeneratorUtility {
    public static generateFieldKey(
        renderAs: TemplateRenderAs,
        definition: FieldDefinitions
    ) {
        return renderAs + '-' + sha1(`${JSON.stringify(definition)}`)
    }
}
