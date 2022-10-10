import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import themePropsSchema_v2021_02_11 from '#spruce/schemas/heartwoodViewControllers/v2021_02_11/themeProps.schema'

const themeSchema: SpruceSchemas.Heartwood.v2021_02_11.ThemeSchema  = {
	id: 'theme',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: 'Theme',
	    fields: {
	            /** . */
	            'slug': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'name': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'props': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: themePropsSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(themeSchema)

export default themeSchema
