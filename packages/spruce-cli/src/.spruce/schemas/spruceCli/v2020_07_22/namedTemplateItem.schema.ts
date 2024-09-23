import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceSchemas } from '../../schemas.types'



const namedTemplateItemSchema: SpruceSchemas.SpruceCli.v2020_07_22.NamedTemplateItemSchema  = {
	id: 'namedTemplateItem',
	version: 'v2020_07_22',
	namespace: 'SpruceCli',
	name: 'NamedTemplateItem',
	description: 'Used to collect input on the names of a class or interface',
	    fields: {
	            /** Readable name. The name people will read */
	            'nameReadable': {
	                label: 'Readable name',
	                type: 'text',
	                isRequired: true,
	                hint: 'The name people will read',
	                options: undefined
	            },
	            /** Readable name (plural). The plural form of the name people will read */
	            'nameReadablePlural': {
	                label: 'Readable name (plural)',
	                type: 'text',
	                isRequired: true,
	                hint: 'The plural form of the name people will read',
	                options: undefined
	            },
	            /** Camel case name. camelCase version of the name */
	            'nameCamel': {
	                label: 'Camel case name',
	                type: 'text',
	                isRequired: true,
	                hint: 'camelCase version of the name',
	                options: undefined
	            },
	            /** Plural camel case name. camelCase version of the name */
	            'nameCamelPlural': {
	                label: 'Plural camel case name',
	                type: 'text',
	                hint: 'camelCase version of the name',
	                options: undefined
	            },
	            /** Pascal case name. PascalCase of the name */
	            'namePascal': {
	                label: 'Pascal case name',
	                type: 'text',
	                hint: 'PascalCase of the name',
	                options: undefined
	            },
	            /** Plural Pascal case name. PascalCase of the name */
	            'namePascalPlural': {
	                label: 'Plural Pascal case name',
	                type: 'text',
	                hint: 'PascalCase of the name',
	                options: undefined
	            },
	            /** Constant case name. CONST_CASE of the name */
	            'nameConst': {
	                label: 'Constant case name',
	                type: 'text',
	                hint: 'CONST_CASE of the name',
	                options: undefined
	            },
	            /** Kebab case name. kebab-case of the name */
	            'nameKebab': {
	                label: 'Kebab case name',
	                type: 'text',
	                hint: 'kebab-case of the name',
	                options: undefined
	            },
	            /** Snake case name. snake_case of the name */
	            'nameSnake': {
	                label: 'Snake case name',
	                type: 'text',
	                hint: 'snake_case of the name',
	                options: undefined
	            },
	            /** Snake case name (plural). snakes_case of the name */
	            'nameSnakePlural': {
	                label: 'Snake case name (plural)',
	                type: 'text',
	                hint: 'snakes_case of the name',
	                options: undefined
	            },
	            /** Description. Describe a bit more here */
	            'description': {
	                label: 'Description',
	                type: 'text',
	                hint: 'Describe a bit more here',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(namedTemplateItemSchema)

export default namedTemplateItemSchema
