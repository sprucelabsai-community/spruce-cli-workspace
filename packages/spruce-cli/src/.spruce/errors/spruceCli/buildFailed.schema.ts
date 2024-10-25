import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const buildFailedSchema: SpruceErrors.SpruceCli.BuildFailedSchema  = {
	id: 'buildFailed',
	namespace: 'SpruceCli',
	name: 'BuildFailed',
	description: 'Error thrown when building or linting failed. Happens when a yarn command fails inside the package utility.',
	    fields: {
	            /** File. File we wanted to build, if not set we wanted to build everything.. */
	            'file': {
	                label: 'File',
	                type: 'text',
	                hint: 'File we wanted to build, if not set we wanted to build everything..',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(buildFailedSchema)

export default buildFailedSchema
