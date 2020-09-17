import { SpruceSchemas } from '../../schemas.types'




const syncSchemaFieldsActionSchema: SpruceSchemas.SpruceCli.v2020_07_22.ISyncSchemaFieldsActionSchema  = {
	id: 'syncSchemaFieldsAction',
	name: 'syncSchemaFieldsAction',
	description: 'Sync schema fields so you can use schemas!',
	    fields: {
	            /** Field types directory. Where field types and interfaces will be generated. */
	            'fieldTypesDestinationDir': {
	                label: 'Field types directory',
	                type: 'text',
	                isPrivate: true,
	                hint: 'Where field types and interfaces will be generated.',
	                defaultValue: "#spruce/schemas",
	                options: undefined
	            },
	            /** Id. Where I'll look for new schema fields to be registered. */
	            'addonsLookupDir': {
	                label: 'Id',
	                type: 'text',
	                hint: 'Where I\'ll look for new schema fields to be registered.',
	                defaultValue: "src/addons",
	                options: undefined
	            },
	            /** Generate field types. Should I generate field types too? */
	            'generateFieldTypes': {
	                label: 'Generate field types',
	                type: 'boolean',
	                isPrivate: true,
	                hint: 'Should I generate field types too?',
	                defaultValue: true,
	                options: undefined
	            },
	    }
}

export default syncSchemaFieldsActionSchema
