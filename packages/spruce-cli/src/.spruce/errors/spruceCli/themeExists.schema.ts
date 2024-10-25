import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const themeExistsSchema: SpruceErrors.SpruceCli.ThemeExistsSchema  = {
	id: 'themeExists',
	namespace: 'SpruceCli',
	name: 'Theme exists',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(themeExistsSchema)

export default themeExistsSchema
