import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const getActiveThemeEmitTargetSchema: SpruceSchemas.Heartwood.v2021_02_11.GetActiveThemeEmitTargetSchema  = {
	id: 'getActiveThemeEmitTarget',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'organizationId': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(getActiveThemeEmitTargetSchema)

export default getActiveThemeEmitTargetSchema
