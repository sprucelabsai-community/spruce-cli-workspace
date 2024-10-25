import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const createAutoloaderFailedSchema: SpruceErrors.SpruceCli.CreateAutoloaderFailedSchema  = {
	id: 'createAutoloaderFailed',
	namespace: 'SpruceCli',
	name: 'Could not create an autoloader',
	description: 'Autoloader creation failed',
	    fields: {
	            /** The globby pattern used to find files. Globby pattern */
	            'globbyPattern': {
	                label: 'The globby pattern used to find files',
	                type: 'text',
	                isRequired: true,
	                hint: 'Globby pattern',
	                options: undefined
	            },
	            /** The files that were loaded. The files that were loaded */
	            'filePaths': {
	                label: 'The files that were loaded',
	                type: 'text',
	                isRequired: true,
	                hint: 'The files that were loaded',
	                isArray: true,
	                options: undefined
	            },
	            /** The suffix for classes to autoload. Class suffix */
	            'suffix': {
	                label: 'The suffix for classes to autoload',
	                type: 'text',
	                isRequired: true,
	                hint: 'Class suffix',
	                options: undefined
	            },
	            /** The directory we're trying to create the autoloader for. Directory to autoload */
	            'directory': {
	                label: 'The directory we\'re trying to create the autoloader for',
	                type: 'text',
	                isRequired: true,
	                hint: 'Directory to autoload',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(createAutoloaderFailedSchema)

export default createAutoloaderFailedSchema
