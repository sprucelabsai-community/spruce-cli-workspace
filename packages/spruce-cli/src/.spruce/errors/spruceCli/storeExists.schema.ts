import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const storeExistsSchema: SpruceErrors.SpruceCli.StoreExistsSchema  = {
	id: 'storeExists',
	namespace: 'SpruceCli',
	name: 'Store exists',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(storeExistsSchema)

export default storeExistsSchema
