import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const directoryNotGoModuleSchema: SpruceErrors.SpruceCli.DirectoryNotGoModuleSchema  = {
	id: 'directoryNotGoModule',
	namespace: 'SpruceCli',
	name: 'Directory not go module',
	    fields: {
	            /** Current Working Directory. */
	            'cwd': {
	                label: 'Current Working Directory',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(directoryNotGoModuleSchema)

export default directoryNotGoModuleSchema
