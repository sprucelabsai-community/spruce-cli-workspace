import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const didRegisterSkillViewsEmitPayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.DidRegisterSkillViewsEmitPayloadSchema  = {
	id: 'didRegisterSkillViewsEmitPayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** View namespace. */
	            'namespace': {
	                label: 'View namespace',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(didRegisterSkillViewsEmitPayloadSchema)

export default didRegisterSkillViewsEmitPayloadSchema
