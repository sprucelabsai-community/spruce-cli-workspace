import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const onboardOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.OnboardOptionsSchema  = {
	id: 'onboardOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Onboard action',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(onboardOptionsSchema)

export default onboardOptionsSchema
