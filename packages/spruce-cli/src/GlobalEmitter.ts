import { AbstractEventEmitter } from '@sprucelabs/mercury-event-emitter'
import {
	buildEventContract,
	MercuryEventEmitter,
} from '@sprucelabs/mercury-types'
import { buildSchema } from '@sprucelabs/schema'
import actionResponseSchema from '#spruce/schemas/spruceCli/v2020_07_22/actionResponse.schema'
import watcherDidDetectChangesEmitPayloadSchema from '#spruce/schemas/spruceCli/v2020_07_22/watcherDidDetectChangesEmitPayload.schema'

export const globalContract = buildEventContract({
	eventSignatures: {
		'watcher.did-detect-change': {
			emitPayloadSchema: watcherDidDetectChangesEmitPayloadSchema,
		},
		'schema.did-fetch-schemas': {
			emitPayloadSchema: buildSchema({
				id: 'didFetchSchemasEmitPayload',
				fields: {
					schemas: {
						type: 'raw',
						isArray: true,
						options: {
							valueType: 'Schema',
						},
					},
				},
			}),
			responsePayloadSchema: buildSchema({
				id: 'didFetchSchemasResponsePayload',
				fields: {
					schemas: {
						type: 'raw',
						isArray: true,
						options: {
							valueType: 'Schema',
						},
					},
				},
			}),
		},
		'skill.register-dashboard-widgets': {},

		'test.register-abstract-test-classes': {
			responsePayloadSchema: buildSchema({
				id: 'registerAbstractTestClassResponsePayload',
				fields: {
					abstractClasses: {
						type: 'schema',
						isRequired: true,
						isArray: true,
						options: {
							schema: buildSchema({
								id: 'abstractClassRegistration',
								fields: {
									name: {
										type: 'text',
										isRequired: true,
									},
									label: {
										type: 'text',
										isRequired: true,
									},
									import: {
										type: 'text',
										isRequired: true,
									},
									featureCode: {
										type: 'text',
									},
								},
							}),
						},
					},
				},
			}),
		},
		'feature.will-execute': {
			emitPayloadSchema: buildSchema({
				id: 'willExecuteEmitPayload',
				importsWhenLocal: [
					'import { FeatureActionResponse } from #spruce/../features/features/features.types',
				],
				fields: {
					featureCode: {
						type: 'text',
						isRequired: true,
					},
					actionCode: {
						type: 'text',
						isRequired: true,
					},
					options: {
						type: 'raw',
						options: {
							valueType: 'Record<string, any>',
						},
					},
				},
			}),
			responsePayloadSchema: actionResponseSchema,
		},
		'feature.did-execute': {
			emitPayloadSchema: buildSchema({
				id: 'didExecuteEmitPayload',
				importsWhenLocal: [
					'import { FeatureActionResponse } from #spruce/../features/features/features.types',
				],
				fields: {
					featureCode: {
						type: 'text',
						isRequired: true,
					},
					actionCode: {
						type: 'text',
						isRequired: true,
					},
					results: {
						type: 'raw',
						isRequired: true,
						options: {
							valueType: 'FeatureActionResponse',
						},
					},
				},
			}),
			responsePayloadSchema: buildSchema({
				id: 'didExecuteResponsePayload',
				fields: {
					...actionResponseSchema.fields,
				},
			}),
		},
		'test.reporter-did-boot': {
			emitPayloadSchema: buildSchema({
				id: 'testReporterDidBootEmitPayload',
				fields: {
					reporter: {
						type: 'raw',
						isRequired: true,
						options: {
							valueType: 'TestAction',
						},
					},
				},
			}),
		},
		'skill.will-write-directory-template': {
			responsePayloadSchema: buildSchema({
				id: 'wilLWriteDirectoryTemplateResponsePayload',
				fields: {
					filesToSkip: {
						type: 'text',
						isArray: true,
					},
				},
			}),
		},
	},
})

export type GlobalEventContract = typeof globalContract
export type GlobalEmitter = MercuryEventEmitter<GlobalEventContract>

export default class CliGlobalEmitter extends AbstractEventEmitter<GlobalEventContract> {
	public static Emitter() {
		return new CliGlobalEmitter(globalContract, {
			shouldEmitSequentally: true,
		}) as GlobalEmitter
	}
}
