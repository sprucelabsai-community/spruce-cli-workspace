import { buildErrorDefinition } from '@sprucelabs/schema'
import FieldType from '#spruce/schemas/fields/fieldTypeEnum'

export default buildErrorDefinition({
	id: 'directoryNotFound',
	name: 'Directory not found',
	description: 'The directory you tried to find is not there!',
	fields: {
		directory: {
			type: FieldType.Text,
			label: 'directory',
			isRequired: true,
			hint: 'The directory we tried to access'
		}
	}
})
