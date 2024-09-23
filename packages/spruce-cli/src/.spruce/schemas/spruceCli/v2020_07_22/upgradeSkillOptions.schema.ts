import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const upgradeSkillOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptionsSchema  = {
	id: 'upgradeSkillOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Upgrade skill action',
	description: 'Upgrade. Everything. Heads up, this can take a few minutes. ⏱',
	    fields: {
	            /** Upgrade mode. */
	            'upgradeMode': {
	                label: 'Upgrade mode',
	                type: 'select',
	                defaultValue: "askForChanged",
	                options: {choices: [{"value":"askForChanged","label":"Ask for changed files"},{"value":"forceEverything","label":"Force everything"},{"value":"forceRequiredSkipRest","label":"Force required (skipping all non-essential)"}],}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(upgradeSkillOptionsSchema)

export default upgradeSkillOptionsSchema
