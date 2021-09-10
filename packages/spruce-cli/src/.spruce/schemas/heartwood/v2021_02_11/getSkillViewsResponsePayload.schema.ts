import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import themeSchema_v2021_02_11 from '#spruce/schemas/heartwoodViewControllers/v2021_02_11/theme.schema'

const getSkillViewsResponsePayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.GetSkillViewsResponsePayloadSchema  = {
	id: 'getSkillViewsResponsePayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'id': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'ids': {
	                type: 'text',
	                isRequired: true,
	                isArray: true,
	                options: undefined
	            },
	            /** . */
	            'source': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'theme': {
	                type: 'schema',
	                options: {schema: themeSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(getSkillViewsResponsePayloadSchema)

export default getSkillViewsResponsePayloadSchema
