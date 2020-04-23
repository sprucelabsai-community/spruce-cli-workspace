import { FieldType, buildErrorDefinition } from '@sprucelabs/schema'

const definitionFailedToImportDefinition = buildErrorDefinition({
	id: 'definitionFailedToImport',
	name: 'Definition failed to import',
	description: 'The definition file failed to import',
	fields: {
		file: {
			type: FieldType.Text,
			label: 'File',
			isRequired: true,
			hint: 'The file definition file I tried to import'
		}
	}
})

export default definitionFailedToImportDefinition
