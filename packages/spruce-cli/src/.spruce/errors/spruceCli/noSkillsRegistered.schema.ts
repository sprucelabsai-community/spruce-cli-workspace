import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const noSkillsRegisteredSchema: SpruceErrors.SpruceCli.NoSkillsRegisteredSchema =
    {
        id: 'noSkillsRegistered',
        namespace: 'SpruceCli',
        name: 'No skills registered',
        fields: {},
    }

SchemaRegistry.getInstance().trackSchema(noSkillsRegisteredSchema)

export default noSkillsRegisteredSchema
