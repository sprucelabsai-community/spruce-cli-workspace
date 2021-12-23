import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import listViewsResultSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/listViewsResult.schema'

const listViewsResponsePayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.ListViewsResponsePayloadSchema  = {
	id: 'listViewsResponsePayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'views': {
	                type: 'schema',
	                isRequired: true,
	                isArray: true,
	                minArrayLength: 0,
	                options: {schema: listViewsResultSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(listViewsResponsePayloadSchema)

export default listViewsResponsePayloadSchema
