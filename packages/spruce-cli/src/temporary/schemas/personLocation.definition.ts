import { ISchema } from '@sprucelabs/schema'
import FieldType from '#spruce/schemas/fields/fieldTypeEnum'
import { CORE_SCHEMA_VERSION } from '../../constants'
import JobSchema from './job.definition'
import LocationSchema from './location.definition'
import personSchema from './person.definition'
import { roleSelectChoices } from './role.definition'

const personLocationSchema: ISchema = {
	id: 'personLocation',
	name: 'Person location',
	description: "A person's visit to a location (business or home).",
	version: CORE_SCHEMA_VERSION.dirValue,
	fields: {
		id: {
			label: 'Id',
			type: FieldType.Id,
		},
		roles: {
			label: 'Name',
			type: FieldType.Select,
			isRequired: true,
			isArray: true,
			options: {
				choices: roleSelectChoices,
			},
		},
		status: {
			label: 'Status',
			type: FieldType.Text,
		},
		visits: {
			label: 'Total visits',
			type: FieldType.Number,
			isRequired: true,
			options: {
				choices: roleSelectChoices,
			},
		},
		lastRecordedVisit: {
			label: 'Last visit',
			type: FieldType.DateTime,
		},
		job: {
			label: 'Job',
			type: FieldType.Schema,
			isRequired: true,
			options: {
				schema: JobSchema,
			},
		},
		location: {
			label: 'Location',
			type: FieldType.Schema,
			isRequired: true,
			options: {
				schema: LocationSchema,
			},
		},
		person: {
			label: 'Person',
			type: FieldType.Schema,
			isRequired: true,
			options: {
				schema: personSchema,
			},
		},
	},
}

export default personLocationSchema
