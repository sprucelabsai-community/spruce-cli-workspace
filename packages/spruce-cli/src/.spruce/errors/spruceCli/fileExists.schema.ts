import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const fileExistsSchema: SpruceErrors.SpruceCli.FileExistsSchema  = {
	id: 'fileExists',
	namespace: 'SpruceCli',
	name: 'fileExists',
	description: 'The file already exists',
	    fields: {
	            /** File. The file being created */
	            'file': {
	                label: 'File',
	                type: 'text',
	                isRequired: true,
	                hint: 'The file being created',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(fileExistsSchema)

export default fileExistsSchema
