import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const listViewsResultSchema: SpruceSchemas.Heartwood.v2021_02_11.ListViewsResultSchema  = {
	id: 'listViewsResult',
	version: 'v2021_02_11',
	namespace: 'Heartwood',
	name: '',
	    fields: {
	            /** . */
	            'namespace': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** Skill view ids. For now this is every view, but soon will be only skill views */
	            'svcIds': {
	                label: 'Skill view ids',
	                type: 'id',
	                isRequired: true,
	                hint: 'For now this is every view, but soon will be only skill views',
	                isArray: true,
	                minArrayLength: 0,
	                options: undefined
	            },
	            /** View ids. For now this is every view, but soon will be only views (not skill views) */
	            'vcIds': {
	                label: 'View ids',
	                type: 'id',
	                isRequired: true,
	                hint: 'For now this is every view, but soon will be only views (not skill views)',
	                isArray: true,
	                minArrayLength: 0,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(listViewsResultSchema)

export default listViewsResultSchema
