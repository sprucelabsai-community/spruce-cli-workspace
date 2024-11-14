import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const appControllerAlreadyExistsSchema: SpruceErrors.SpruceCli.AppControllerAlreadyExistsSchema  = {
	id: 'appControllerAlreadyExists',
	namespace: 'SpruceCli',
	name: 'App view controller already exists',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(appControllerAlreadyExistsSchema)

export default appControllerAlreadyExistsSchema
