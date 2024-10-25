import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const skillNotRegisteredSchema: SpruceErrors.SpruceCli.SkillNotRegisteredSchema  = {
	id: 'skillNotRegistered',
	namespace: 'SpruceCli',
	name: 'Skill not registered',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(skillNotRegisteredSchema)

export default skillNotRegisteredSchema
