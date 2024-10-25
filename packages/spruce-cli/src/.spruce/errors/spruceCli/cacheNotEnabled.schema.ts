import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const cacheNotEnabledSchema: SpruceErrors.SpruceCli.CacheNotEnabledSchema  = {
	id: 'cacheNotEnabled',
	namespace: 'SpruceCli',
	name: 'Cache not enabled',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(cacheNotEnabledSchema)

export default cacheNotEnabledSchema
