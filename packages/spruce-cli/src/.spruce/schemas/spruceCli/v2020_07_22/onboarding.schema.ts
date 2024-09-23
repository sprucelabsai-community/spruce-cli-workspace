import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const onboardingSchema: SpruceSchemas.SpruceCli.v2020_07_22.OnboardingSchema  = {
	id: 'onboarding',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Onboarding',
	description: 'Track onboarding progress and tutorials & quizzes completed.',
	    fields: {
	            /** mode. */
	            'mode': {
	                label: 'mode',
	                type: 'select',
	                isRequired: true,
	                options: {choices: [{"label":"Short","value":"short"},{"label":"Immersive","value":"immersive"},{"label":"Off","value":"off"}],}
	            },
	            /** Stage. */
	            'stage': {
	                label: 'Stage',
	                type: 'select',
	                options: {choices: [{"label":"Create skill","value":"create.skill"},{"label":"Test","value":"test"}],}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(onboardingSchema)

export default onboardingSchema
