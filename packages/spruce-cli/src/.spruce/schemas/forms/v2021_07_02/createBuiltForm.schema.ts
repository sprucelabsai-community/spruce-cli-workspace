import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import builderImportExportPageSchema_v2021_02_11 from '#spruce/schemas/heartwoodViewControllers/v2021_02_11/builderImportExportPage.schema'

const createBuiltFormSchema: SpruceSchemas.Forms.v2021_07_02.CreateBuiltFormSchema  = {
	id: 'createBuiltForm',
	version: 'v2021_07_02',
	namespace: 'Forms',
	name: '',
	    fields: {
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

SchemaRegistry.getInstance().trackSchema(createBuiltFormSchema)

export default createBuiltFormSchema