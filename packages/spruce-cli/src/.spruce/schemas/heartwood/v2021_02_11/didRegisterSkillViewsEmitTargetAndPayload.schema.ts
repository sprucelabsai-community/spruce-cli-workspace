import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import didRegisterSkillViewsEmitPayloadSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/didRegisterSkillViewsEmitPayload.schema'

const didRegisterSkillViewsEmitTargetAndPayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.DidRegisterSkillViewsEmitTargetAndPayloadSchema  = {
	id: 'didRegisterSkillViewsEmitTargetAndPayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'payload': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: didRegisterSkillViewsEmitPayloadSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(didRegisterSkillViewsEmitTargetAndPayloadSchema)

export default didRegisterSkillViewsEmitTargetAndPayloadSchema
