import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const skillFeatureSchema: SpruceSchemas.SpruceCli.v2020_07_22.SkillFeatureSchema  = {
	id: 'skillFeature',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Skill feature options',
	    fields: {
	            /** . */
	            'destination': {
	                type: 'text',
	                defaultValue: ".",
	                options: undefined
	            },
	            /** What's the name of your skill?. This marketing focused, like "8-bit Stories" or "Adventures". */
	            'name': {
	                label: 'What\'s the name of your skill?',
	                type: 'text',
	                isRequired: true,
	                hint: 'This marketing focused, like "8-bit Stories" or "Adventures".',
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
