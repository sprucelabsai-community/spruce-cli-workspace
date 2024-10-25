import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const failedToImportSchema: SpruceErrors.SpruceCli.FailedToImportSchema  = {
	id: 'failedToImport',
	namespace: 'SpruceCli',
	name: 'FailedToImport',
	description: 'Failed to import a file through VM',
	    fields: {
	            /** File. The file I tried to import */
	            'file': {
	                label: 'File',
	                type: 'text',
	                isRequired: true,
	                hint: 'The file I tried to import',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(failedToImportSchema)

export default failedToImportSchema
