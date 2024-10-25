import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const skillNotFoundSchema: SpruceErrors.SpruceCli.SkillNotFoundSchema  = {
	id: 'skillNotFound',
	namespace: 'SpruceCli',
	name: 'skill not found',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(skillNotFoundSchema)

export default skillNotFoundSchema
