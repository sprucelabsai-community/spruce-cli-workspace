import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import themeSchema_v2021_02_11 from '#spruce/schemas/heartwoodViewControllers/v2021_02_11/theme.schema'

const registerSkillViewsEmitPayloadSchema: SpruceSchemas.Heartwood.v2021_02_11.RegisterSkillViewsEmitPayloadSchema  = {
	id: 'registerSkillViewsEmitPayload',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
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

SchemaRegistry.getInstance().trackSchema(registerSkillViewsEmitPayloadSchema)

export default registerSkillViewsEmitPayloadSchema
