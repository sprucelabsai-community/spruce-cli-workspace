import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const appViewControllerAlreadyExistsSchema: SpruceErrors.SpruceCli.AppViewControllerAlreadyExistsSchema  = {
	id: 'appViewControllerAlreadyExists',
	namespace: 'SpruceCli',
	name: 'App view controller already exists',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(appViewControllerAlreadyExistsSchema)

export default appViewControllerAlreadyExistsSchema
