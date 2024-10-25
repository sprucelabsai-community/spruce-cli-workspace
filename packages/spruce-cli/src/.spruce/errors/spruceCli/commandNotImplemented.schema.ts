import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const commandNotImplementedSchema: SpruceErrors.SpruceCli.CommandNotImplementedSchema  = {
	id: 'commandNotImplemented',
	namespace: 'SpruceCli',
	name: 'Command not implemented',
	description: 'This command has not yet been implemented ',
	    fields: {
	            /** Command. the command being run! */
	            'command': {
	                label: 'Command',
	                type: 'text',
	                isRequired: true,
	                hint: 'the command being run!',
	                options: undefined
	            },
	            /** Args. Arguments passed to the command */
	            'args': {
	                label: 'Args',
	                type: 'text',
	                hint: 'Arguments passed to the command',
	                isArray: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(commandNotImplementedSchema)

export default commandNotImplementedSchema
