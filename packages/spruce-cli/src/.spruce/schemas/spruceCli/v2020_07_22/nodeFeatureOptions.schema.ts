import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const nodeFeatureOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.NodeFeatureOptionsSchema  = {
	id: 'nodeFeatureOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Node feature options',
	    fields: {
	            /** . */
	            'destination': {
	                type: 'text',
	                defaultValue: ".",
	                options: undefined
	            },
	            /** What's the name of your module?. */
	            'name': {
	                label: 'What\'s the name of your module?',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** How would you describe your module?. */
	            'description': {
	                label: 'How would you describe your module?',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(nodeFeatureOptionsSchema)

export default nodeFeatureOptionsSchema
