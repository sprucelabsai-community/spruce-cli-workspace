import { buildSchema } from '@sprucelabs/schema'
import syncEventOptionsBuilder from './syncEventOptions.builder'

export default buildSchema({
	id: 'listenEventOptions',
	name: 'Listen to event action',
	description: 'Options for event.listen.',
	fields: {
		...syncEventOptionsBuilder.fields,
		namespace: {
			type: 'text',
			label: 'Namespace',
		},
		eventName: {
			type: 'text',
			label: 'Event name',
		},
		listenerDestinationDir: {
			type: 'text',
			label: 'Events destination directory',
			hint: 'Where should I add your listeners?',
			defaultValue: 'src/listeners',
		},
		version: {
			type: 'text',
			label: 'Version',
			hint: 'Set a version yourself instead of letting me generate one for you',
			isPrivate: true,
		},
	},
})
