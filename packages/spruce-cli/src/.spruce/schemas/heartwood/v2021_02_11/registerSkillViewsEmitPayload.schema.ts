import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import registerationThemeSchema_v2021_02_11 from '#spruce/schemas/heartwood/v2021_02_11/registerationTheme.schema'

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
	                options: {schema: registerationThemeSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(registerSkillViewsEmitPayloadSchema)

export default registerSkillViewsEmitPayloadSchema
