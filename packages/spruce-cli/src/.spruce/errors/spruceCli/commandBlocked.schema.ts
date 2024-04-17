import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const commandBlockedSchema: SpruceErrors.SpruceCli.CommandBlockedSchema = {
    id: 'commandBlocked',
    namespace: 'SpruceCli',
    name: 'Command blocked',
    fields: {
        /** . */
        command: {
            type: 'text',
            isRequired: true,
            options: undefined,
        },
        /** . */
        hint: {
            type: 'text',
            isRequired: true,
            options: undefined,
        },
    },
}

SchemaRegistry.getInstance().trackSchema(commandBlockedSchema)

export default commandBlockedSchema
