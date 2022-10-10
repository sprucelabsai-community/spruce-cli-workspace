import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import eventSourceSchema_v2021_09_13 from '#spruce/schemas/spruceEventUtils/v2021_09_13/eventSource.schema'
import upsertThemeEmitTargetSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/upsertThemeEmitTarget.schema'
import upsertThemeEmitPayloadSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/upsertThemeEmitPayload.schema'

const upsertThemeEmitTargetAndPayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.UpsertThemeEmitTargetAndPayloadSchema  = {
	id: 'upsertThemeEmitTargetAndPayload',
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
	                options: {schema: upsertThemeEmitTargetSchema_v2021_02_11,}
	            },
	            /** . */
	            'payload': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: upsertThemeEmitPayloadSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(upsertThemeEmitTargetAndPayloadSchema)

export default upsertThemeEmitTargetAndPayloadSchema
