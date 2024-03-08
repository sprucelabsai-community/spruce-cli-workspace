import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
	id: 'viewPluginAlreadyExists',
	name: 'View plugin already exists',
	fields: {
		name: {
			type: 'text',
			isRequired: true,
		},
	},
})
