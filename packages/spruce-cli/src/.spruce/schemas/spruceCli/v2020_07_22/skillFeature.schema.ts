import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const skillFeatureSchema: SpruceSchemas.SpruceCli.v2020_07_22.SkillFeatureSchema  = {
	id: 'skillFeature',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Skill feature options',
	    fields: {
	            /** What's the name of your skill?. */
	            'name': {
	                label: 'What\'s the name of your skill?',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** How would you describe your skill?. */
	            'description': {
	                label: 'How would you describe your skill?',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(skillFeatureSchema)

export default skillFeatureSchema
