import { buildSchema } from '@sprucelabs/schema'
import generatedFileBuilder from './generatedFile.builder'

export default buildSchema({
	id: 'actionResponse',
	name: 'Action response',
	importsWhenLocal: [`import AbstractSpruceError from '@sprucelabs/error'`],
	fields: {
		files: {
			type: 'schema',
			isArray: true,
			options: {
				schema: generatedFileBuilder,
			},
		},
		headline: {
			type: 'text',
		},
		hints: {
			type: 'text',
			isArray: true,
		},
		summaryLines: {
			type: 'text',
			isArray: true,
		},
		errors: {
			type: 'raw',
			isArray: true,
			options: {
				valueType: 'AbstractSpruceError<any>',
			},
		},
		meta: {
			type: 'raw',
			options: {
				valueType: 'Record<string, any>',
			},
		},
		packagesInstalled: {
			type: 'schema',
			isArray: true,
			options: {
				schema: buildSchema({
					id: 'npmPackage',
					fields: {
						name: {
							type: 'text',
							isRequired: true,
						},
						version: {
							type: 'text',
						},
						isDev: {
							type: 'boolean',
						},
					},
				}),
			},
		},
	},
})
