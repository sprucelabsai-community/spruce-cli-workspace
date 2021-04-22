import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const setupTestsOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.SetupTestsOptionsSchema  = {
	id: 'setupTestsOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Setup tests options',
	    fields: {
	            /** Demo phone number. */
	            'demoNumber': {
	                label: 'Demo phone number',
	                type: 'phone',
	                isRequired: true,
	                options: undefined
	            },
	            /** Skill slug. */
	            'skillSlug': {
	                label: 'Skill slug',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(setupTestsOptionsSchema)

export default setupTestsOptionsSchema