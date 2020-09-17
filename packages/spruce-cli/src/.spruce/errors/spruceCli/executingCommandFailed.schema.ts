import { SpruceErrors } from '../errors.types'




const executingCommandFailedSchema: SpruceErrors.SpruceCli.IExecutingCommandFailedSchema  = {
	id: 'executingCommandFailed',
	name: 'Executing command failed',
	description: 'The command that was being executed failed',
	    fields: {
	            /** The command being run. */
	            'cmd': {
	                label: 'The command being run',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** Args. */
	            'args': {
	                label: 'Args',
	                type: 'text',
	                isArray: true,
	                options: undefined
	            },
	            /** Cwd. */
	            'cwd': {
	                label: 'Cwd',
	                type: 'text',
	                options: undefined
	            },
	            /** Stdout. */
	            'stdout': {
	                label: 'Stdout',
	                type: 'text',
	                options: undefined
	            },
	            /** stderr. */
	            'stderr': {
	                label: 'stderr',
	                type: 'text',
	                options: undefined
	            },
	    }
}

export default executingCommandFailedSchema
