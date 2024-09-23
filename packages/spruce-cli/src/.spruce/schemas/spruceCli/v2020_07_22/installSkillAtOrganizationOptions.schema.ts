import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const installSkillAtOrganizationOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.InstallSkillAtOrganizationOptionsSchema  = {
	id: 'installSkillAtOrganizationOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'install skill at organization action',
	description: 'Install your skill at any organization you are connected to.',
	    fields: {
	            /** Organization id. */
	            'organizationId': {
	                label: 'Organization id',
	                type: 'id',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(installSkillAtOrganizationOptionsSchema)

export default installSkillAtOrganizationOptionsSchema
