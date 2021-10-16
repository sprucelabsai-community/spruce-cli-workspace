import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const listFormsFormSchema: SpruceSchemas.Forms.v2021_07_02.ListFormsFormSchema  = {
	id: 'listFormsForm',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
	            /** . */
	            'id': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'dateDeleted': {
	                type: 'number',
	                isPrivate: true,
	                options: undefined
	            },
	            /** Title. */
	            'title': {
	                label: 'Title',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** Subtitle. */
	            'subtitle': {
	                label: 'Subtitle',
	                type: 'text',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(listFormsFormSchema)

export default listFormsFormSchema
