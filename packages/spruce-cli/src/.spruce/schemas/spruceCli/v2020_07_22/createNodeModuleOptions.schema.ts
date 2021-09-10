import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const createNodeModuleOptionsSchema: SpruceSchemas.SpruceCli.v2020_07_22.CreateNodeModuleOptionsSchema  = {
	id: 'createNodeModuleOptions',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Create node module options',
	    fields: {
	            /** First Field. */
	            'fieldName1': {
	                label: 'First Field',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** Second Field. A hint */
	            'fieldName2': {
	                label: 'Second Field',
	                type: 'number',
	                isRequired: true,
	                hint: 'A hint',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(createNodeModuleOptionsSchema)

export default createNodeModuleOptionsSchema
