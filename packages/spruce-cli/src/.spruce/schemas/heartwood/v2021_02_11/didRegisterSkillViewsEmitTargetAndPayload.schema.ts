import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import eventSourceSchema_v2021_09_13 from '#spruce/schemas/spruceEventUtils/v2021_09_13/eventSource.schema'
import didRegisterSkillViewsEmitTargetSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/didRegisterSkillViewsEmitTarget.schema'
import didRegisterSkillViewsEmitPayloadSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/didRegisterSkillViewsEmitPayload.schema'

const didRegisterSkillViewsEmitTargetAndPayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.DidRegisterSkillViewsEmitTargetAndPayloadSchema  = {
	id: 'didRegisterSkillViewsEmitTargetAndPayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** Source. */
	            'source': {
	                label: 'Source',
	                type: 'schema',
	                options: {schema: eventSourceSchema_v2021_09_13,}
	            },
	            /** . */
	            'target': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: didRegisterSkillViewsEmitTargetSchema_v2021_02_11,}
	            },
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
