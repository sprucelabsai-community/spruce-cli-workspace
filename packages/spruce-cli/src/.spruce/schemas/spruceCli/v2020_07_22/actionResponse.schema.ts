import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'

import generatedFileSchema_v2020_07_22 from '#spruce/schemas/spruceCli/v2020_07_22/generatedFile.schema'
import npmPackageSchema_v2020_07_22 from '#spruce/schemas/spruceCli/v2020_07_22/npmPackage.schema'

const actionResponseSchema: SpruceSchemas.SpruceCli.v2020_07_22.ActionResponseSchema  = {
	id: 'actionResponse',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'Action response',
	    fields: {
	            /** . */
	            'files': {
	                type: 'schema',
	                isArray: true,
	                options: {schema: generatedFileSchema_v2020_07_22,}
	            },
	            /** . */
	            'headline': {
	                type: 'text',
	                options: undefined
	            },
	            /** . */
	            'hints': {
	                type: 'text',
	                isArray: true,
	                options: undefined
	            },
	            /** . */
	            'summaryLines': {
	                type: 'text',
	                isArray: true,
	                options: undefined
	            },
	            /** . */
	            'errors': {
	                type: 'raw',
	                isArray: true,
	                options: {valueType: `AbstractSpruceError<any>`,}
	            },
	            /** . */
	            'meta': {
	                type: 'raw',
	                options: {valueType: `Record<string, any>`,}
	            },
	            /** . */
	            'packagesInstalled': {
	                type: 'schema',
	                isArray: true,
	                options: {schema: npmPackageSchema_v2020_07_22,}
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(actionResponseSchema)

export default actionResponseSchema
