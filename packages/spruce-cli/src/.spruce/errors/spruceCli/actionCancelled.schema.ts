import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const actionCancelledSchema: SpruceErrors.SpruceCli.ActionCancelledSchema  = {
	id: 'actionCancelled',
	namespace: 'SpruceCli',
	name: 'Action cancelled',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(actionCancelledSchema)

export default actionCancelledSchema
