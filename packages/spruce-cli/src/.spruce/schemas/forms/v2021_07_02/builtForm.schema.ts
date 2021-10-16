import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import builderImportExportPageSchema_v2021_02_11 from '#spruce/schemas/heartwoodViewControllers/v2021_02_11/builderImportExportPage.schema'

const builtFormSchema: SpruceSchemas.Forms.v2021_07_02.BuiltFormSchema  = {
	id: 'builtForm',
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
	            /** Pages. */
	            'pages': {
	                label: 'Pages',
	                type: 'schema',
	                isRequired: true,
	                isArray: true,
	                options: {schema: builderImportExportPageSchema_v2021_02_11,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(builtFormSchema)

export default builtFormSchema
