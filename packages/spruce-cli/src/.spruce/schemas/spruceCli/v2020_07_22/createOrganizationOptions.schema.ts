import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const createOrganizationOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.CreateOrganizationOptionsSchema  = {
	id: 'createOrganizationOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'create organization action',
	description: 'Skills can only communicate with people and skills associated with the same organization. This ensures people can get differentiated experiences across multiple businesses.',
	    fields: {
	            /** Name. The name people will read */
	            'nameReadable': {
	                label: 'Name',
	                type: 'text',
	                isRequired: true,
	                hint: 'The name people will read',
	                options: undefined
	            },
	            /** Slug. kebab-case of the name */
	            'nameKebab': {
	                label: 'Slug',
	                type: 'text',
	                hint: 'kebab-case of the name',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(createOrganizationOptionsSchema)

export default createOrganizationOptionsSchema
