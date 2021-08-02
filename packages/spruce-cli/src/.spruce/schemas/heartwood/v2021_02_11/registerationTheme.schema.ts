import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import themePropsSchema_v2021_02_11 from '#spruce/schemas/heartwoodViewControllers/v2021_02_11/themeProps.schema'

const registerationThemeSchema: SpruceSchemas.Heartwood.v2021_02_11.RegisterationThemeSchema  = {
	id: 'registerationTheme',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'props': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: themePropsSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(registerationThemeSchema)

export default registerationThemeSchema
