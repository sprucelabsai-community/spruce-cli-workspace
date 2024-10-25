import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const schemaTemplateItemBuildingFailedSchema: SpruceErrors.SpruceCli.SchemaTemplateItemBuildingFailedSchema  = {
	id: 'schemaTemplateItemBuildingFailed',
	namespace: 'SpruceCli',
	name: 'Schema template item building failed',
	    fields: {
	            /** . */
	            'schemaId': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'schemaNamespace': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'fieldName': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'fieldOptions': {
	                type: 'raw',
	                isRequired: true,
	                options: {valueType: `Record<string, any>`,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(schemaTemplateItemBuildingFailedSchema)

export default schemaTemplateItemBuildingFailedSchema
