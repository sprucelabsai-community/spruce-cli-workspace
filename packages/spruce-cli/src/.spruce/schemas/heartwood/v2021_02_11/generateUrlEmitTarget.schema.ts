import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const generateUrlEmitTargetSchema: SpruceSchemas.Heartwood.v2021_02_11.GenerateUrlEmitTargetSchema  = {
	id: 'generateUrlEmitTarget',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	importsWhenRemote: ['import { SkillViewControllerId } from \'@sprucelabs/heartwood-view-controllers\'',],
	    fields: {
	            /** Skill View Id. */
	            'skillViewId': {
	                label: 'Skill View Id',
	                type: 'raw',
	                options: {valueType: `SkillViewControllerId`,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(generateUrlEmitTargetSchema)

export default generateUrlEmitTargetSchema
