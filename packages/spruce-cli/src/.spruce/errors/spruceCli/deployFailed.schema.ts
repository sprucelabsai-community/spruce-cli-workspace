import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const deployFailedSchema: SpruceErrors.SpruceCli.DeployFailedSchema  = {
	id: 'deployFailed',
	namespace: 'SpruceCli',
	name: 'Deploy Failed',
	    fields: {
	            /** . */
	            'stage': {
	                type: 'select',
	                isRequired: true,
	                options: {choices: [{"label":"Skill","value":"skill"},{"label":"Building","value":"building"},{"label":"Testing","value":"testing"},{"label":"Git","value":"git"},{"label":"Procfile","value":"procfile"},{"label":"Remote","value":"remote"},{"label":"Heroku","value":"heroku"}],}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(deployFailedSchema)

export default deployFailedSchema
