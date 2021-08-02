import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import completedFormSourceFormSchema_v2021_07_02 from '#spruce/schemas/forms/v2021_07_02/completedFormSourceForm.schema'

const getCompletedFormEventFormSchema: SpruceSchemas.Forms.v2021_07_02.GetCompletedFormEventFormSchema  = {
	id: 'getCompletedFormEventForm',
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
	            'dateCreated': {
	                type: 'number',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'dateUpdated': {
	                type: 'number',
	                options: undefined
	            },
	            /** . */
	            'sourceForm': {
	                type: 'schema',
	                isRequired: true,
	                options: {schema: completedFormSourceFormSchema_v2021_07_02,}
	            },
	            /** . */
	            'sourceFormId': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'personId': {
	                type: 'id',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'values': {
	                type: 'raw',
	                isArray: true,
	                options: {valueType: `Record<string, any>`,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(getCompletedFormEventFormSchema)

export default getCompletedFormEventFormSchema
