import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const invalidCommandSchema: SpruceErrors.SpruceCli.InvalidCommandSchema  = {
	id: 'invalidCommand',
	namespace: 'SpruceCli',
	name: 'Invalid command',
	description: 'The command is not valid, try --help',
	    fields: {
	            /** args. */
	            'args': {
	                label: 'args',
	                type: 'text',
	                isRequired: true,
	                isArray: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(invalidCommandSchema)

export default invalidCommandSchema
