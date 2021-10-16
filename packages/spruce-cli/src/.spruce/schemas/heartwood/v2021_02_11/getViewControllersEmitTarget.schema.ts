import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const getViewControllersEmitTargetSchema: SpruceSchemas.Heartwood.v2021_02_11.GetViewControllersEmitTargetSchema  = {
	id: 'getViewControllersEmitTarget',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'namespace': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(getViewControllersEmitTargetSchema)

export default getViewControllersEmitTargetSchema
