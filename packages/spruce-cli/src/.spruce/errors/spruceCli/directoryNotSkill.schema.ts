import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const directoryNotSkillSchema: SpruceErrors.SpruceCli.DirectoryNotSkillSchema  = {
	id: 'directoryNotSkill',
	namespace: 'SpruceCli',
	name: 'Dir not skill',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(directoryNotSkillSchema)

export default directoryNotSkillSchema
