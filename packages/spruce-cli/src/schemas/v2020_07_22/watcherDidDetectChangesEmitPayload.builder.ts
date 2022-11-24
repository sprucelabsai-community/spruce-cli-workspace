import { buildSchema } from '@sprucelabs/schema'
import generatedFileBuilder from './generatedFile.builder'

export default buildSchema({
	id: 'watcherDidDetectChangesEmitPayload',
	name: 'Watcher did detect changes emit payload',
	fields: {
		changes: {
			type: 'schema',
			isRequired: true,
			isArray: true,
			options: {
				schemas: [
					generatedFileBuilder,
					buildSchema({
						id: 'generatedDir',
						fields: generatedFileBuilder.fields,
					}),
				],
			},
		},
	},
})
