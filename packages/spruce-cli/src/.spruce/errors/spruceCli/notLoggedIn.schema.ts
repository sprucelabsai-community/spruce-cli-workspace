import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const notLoggedInSchema: SpruceErrors.SpruceCli.NotLoggedInSchema  = {
	id: 'notLoggedIn',
	namespace: 'SpruceCli',
	name: 'Not logged in',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(notLoggedInSchema)

export default notLoggedInSchema
