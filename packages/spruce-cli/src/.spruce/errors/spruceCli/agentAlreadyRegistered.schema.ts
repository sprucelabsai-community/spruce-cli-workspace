import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const agentAlreadyRegisteredSchema: SpruceErrors.SpruceCli.AgentAlreadyRegisteredSchema  = {
	id: 'agentAlreadyRegistered',
	namespace: 'SpruceCli',
	name: 'agent already registered',
	    fields: {
	            /** Prompt Path. The path to the existing agent prompt file. */
	            'promptPath': {
	                label: 'Prompt Path',
	                type: 'text',
	                isRequired: true,
	                hint: 'The path to the existing agent prompt file.',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(agentAlreadyRegisteredSchema)

export default agentAlreadyRegisteredSchema
