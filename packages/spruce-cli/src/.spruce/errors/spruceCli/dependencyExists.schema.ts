import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const dependencyExistsSchema: SpruceErrors.SpruceCli.DependencyExistsSchema  = {
	id: 'dependencyExists',
	namespace: 'SpruceCli',
	name: 'Dependency exists',
	    fields: {
	            /** . */
	            'namespace': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(dependencyExistsSchema)

export default dependencyExistsSchema
