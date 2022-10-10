import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const upsertThemeEmitTargetSchema: SpruceSchemas.Heartwood.v2021_02_11.UpsertThemeEmitTargetSchema  = {
	id: 'upsertThemeEmitTarget',
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

SchemaRegistry.getInstance().trackSchema(upsertThemeEmitTargetSchema)

export default upsertThemeEmitTargetSchema
