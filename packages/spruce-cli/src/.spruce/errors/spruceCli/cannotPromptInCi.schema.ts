import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const cannotPromptInCiSchema: SpruceErrors.SpruceCli.CannotPromptInCiSchema  = {
	id: 'cannotPromptInCi',
	namespace: 'SpruceCli',
	name: 'cannot prompt in ci',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(cannotPromptInCiSchema)

export default cannotPromptInCiSchema
