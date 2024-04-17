import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const skillViewExistsSchema: SpruceErrors.SpruceCli.SkillViewExistsSchema = {
    id: 'skillViewExists',
    namespace: 'SpruceCli',
    name: 'Skill view exists',
    fields: {
        /** . */
        name: {
            type: 'text',
            isRequired: true,
            options: undefined,
        },
    },
}

SchemaRegistry.getInstance().trackSchema(skillViewExistsSchema)

export default skillViewExistsSchema
