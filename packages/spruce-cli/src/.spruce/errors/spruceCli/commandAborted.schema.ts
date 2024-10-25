import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const commandAbortedSchema: SpruceErrors.SpruceCli.CommandAbortedSchema  = {
	id: 'commandAborted',
	namespace: 'SpruceCli',
	name: 'Command aborted',
	    fields: {
	            /** Command. */
	            'command': {
	                label: 'Command',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(commandAbortedSchema)

export default commandAbortedSchema
