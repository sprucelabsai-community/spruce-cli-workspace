import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const bootSkillOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.BootSkillOptionsSchema  = {
	id: 'bootSkillOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Boot skill action',
	description: 'The options for skill.boot.',
	    fields: {
	            /** Run local. Will run using ts-node and typescript directly. Longer boot times */
	            'local': {
	                label: 'Run local',
	                type: 'boolean',
	                hint: 'Will run using ts-node and typescript directly. Longer boot times',
	                options: undefined
	            },
	            /** Wait until skill is booted. For testing. Returns immediately after executing test so the running tests can be managed programatically. */
	            'shouldReturnImmediately': {
	                label: 'Wait until skill is booted',
	                type: 'boolean',
	                isPrivate: true,
	                hint: 'For testing. Returns immediately after executing test so the running tests can be managed programatically.',
	                defaultValue: false,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(bootSkillOptionsSchema)

export default bootSkillOptionsSchema
