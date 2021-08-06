import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
	id: 'transportAlreadyExists',
	name: 'transport already exists',
	fields: {
		name: {
			type: 'text',
			label: 'Transport name',
			isRequired: true,
		},
	},
})
