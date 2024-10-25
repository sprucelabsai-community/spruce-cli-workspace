import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const missingDependenciesDependencySchema: SpruceErrors.SpruceCli.MissingDependenciesDependencySchema  = {
	id: 'missingDependenciesDependency',
	namespace: 'SpruceCli',
	name: '',
	    fields: {
	            /** . */
	            'name': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'hint': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(missingDependenciesDependencySchema)

export default missingDependenciesDependencySchema
