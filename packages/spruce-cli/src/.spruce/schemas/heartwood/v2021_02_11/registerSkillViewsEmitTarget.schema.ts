import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const registerSkillViewsEmitTargetSchema: SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitTargetSchema  = {
	id: 'registerSkillViewsEmitTarget',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'personId': {
	                type: 'id',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(registerSkillViewsEmitTargetSchema)

export default registerSkillViewsEmitTargetSchema
