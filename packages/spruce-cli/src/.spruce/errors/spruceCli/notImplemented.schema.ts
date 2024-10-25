import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const notImplementedSchema: SpruceErrors.SpruceCli.NotImplementedSchema  = {
	id: 'notImplemented',
	namespace: 'SpruceCli',
	name: 'Not implemented',
	description: 'This feature has not been implemented',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(notImplementedSchema)

export default notImplementedSchema
