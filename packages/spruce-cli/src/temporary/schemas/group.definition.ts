import { ISchema } from '@sprucelabs/schema'
import FieldType from '#spruce/schemas/fields/fieldTypeEnum'
import { CORE_SCHEMA_VERSION } from '../../constants'
import AclSchema from './acl.definition'
import { roleSelectChoices } from './role.definition'

const groupSchema: ISchema = {
	id: 'job',
	name: 'Job',
	version: CORE_SCHEMA_VERSION.dirValue,
	description:
		'A position at a company. The answer to the question; What is your job?',
	fields: {
		id: {
			label: 'Id',
			type: FieldType.Id,
		},
		isDefault: {
			label: 'Is default',
			hint:
				'Is this job one that comes with every org? Mapped to roles (owner, groupManager, manager, guest).',
			type: FieldType.Text,
			isRequired: true,
		},
		name: {
			label: 'Name',
			type: FieldType.Text,
			isRequired: true,
		},
		role: {
			label: 'Role',
			type: FieldType.Select,
			isRequired: true,
			options: {
				choices: roleSelectChoices,
			},
		},
		inStoreAcls: {
			label: 'On work permissions',
			type: FieldType.Schema,
			options: {
				schema: AclSchema,
			},
		},
		acls: {
			label: 'Off work permissions',
			type: FieldType.Schema,
			options: {
				schema: AclSchema,
			},
		},
	},
}

export default groupSchema
