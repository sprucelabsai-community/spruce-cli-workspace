import {
	buildSchema,
	normalizeSchemaToIdWithVersion,
	Schema,
	validateSchema,
} from '@sprucelabs/schema'
import * as coreSchemas from '@sprucelabs/spruce-core-schemas'
import {
	CORE_NAMESPACE,
	diskUtil,
	namesUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssert } from '@sprucelabs/test-utils'
import fieldClassMap from '#spruce/schemas/fields/fieldClassMap'
import AbstractSchemaTest from '../../tests/AbstractSchemaTest'

const LOCAL_NAMESPACE = 'TestSkill'

export default class SchemaStoreTest extends AbstractSchemaTest {
	@test()
	protected static async canInstantiateSchemaStore() {
		assert.isTruthy(this.Store('schema'))
	}

	@test()
	protected static async hasFetchSchemaTemplateItemsMethod() {
		assert.isFunction(this.Store('schema').fetchSchemas)
		assert.isFunction(this.Store('schema').fetchFields)
	}

	@test()
	protected static async fetchesCoreSchemas() {
		const results = await this.Store('schema').fetchSchemas({
			localNamespace: LOCAL_NAMESPACE,
		})
		const { schemasByNamespace, errors } = results

		assert.isEqual(errors.length, 0)
		assert.isTruthy(schemasByNamespace[CORE_NAMESPACE])

		const coreSchemas = schemasByNamespace[CORE_NAMESPACE]
		assert.isAbove(coreSchemas.length, 0)

		this.validateSchemas(coreSchemas)

		assert.doesInclude(coreSchemas, { id: 'person' })
		assert.doesInclude(coreSchemas, { id: 'skill' })
	}

	@test()
	protected static async fetchesLocalSchemas() {
		const results = await this.copySchemasAndFetchSchemas({
			localSchemaDir: this.resolvePath('src', 'schemas'),
		})
		const { schemasByNamespace, errors } = results

		assert.isEqual(errors.length, 0)
		assert.isTruthy(schemasByNamespace[LOCAL_NAMESPACE])
		assert.isLength(Object.keys(schemasByNamespace), 2)

		const localSchemas = schemasByNamespace[LOCAL_NAMESPACE]

		this.validateSchemas(localSchemas)
		assert.isLength(localSchemas, 3)
	}

	@test.skip(
		"Skipped because schemas are bulk imported and it's all or nothing."
	)
	protected static async canHandleABadSchema() {
		const results = await this.copySchemasAndFetchSchemas(
			{
				localSchemaDir: this.resolvePath('src', 'schemas'),
			},
			'test_builders_one_bad'
		)

		assert.isEqual(results.errors.length, 1)

		assert.doesInclude(results.errors[0].message, 'badSchema')

		const { schemasByNamespace } = results
		const localSchemas = schemasByNamespace[LOCAL_NAMESPACE]

		this.validateSchemas(localSchemas)
		assert.isLength(localSchemas, 3)
	}

	@test()
	protected static async canFetchCoreFields() {
		const results = await SchemaStoreTest.copySchemasAndFieldsThenFetchFields()

		const fieldTypes = Object.keys(fieldClassMap)

		for (const type of fieldTypes) {
			assert.doesInclude(results, {
				'fields[].registration.type': namesUtil.toPascal(type),
			})
		}
	}

	@test()
	protected static async canFetchLocalFields() {
		const results = await this.copySchemasAndFieldsThenFetchFields({
			localAddonsDir: this.resolvePath('src', 'addons'),
		})

		assert.isLength(results.errors, 0)
		assert.isLength(results.fields, Object.keys(fieldClassMap).length + 1)
		assert.doesInclude(results, { 'fields[].registration.type': 'Test' })
		assert.doesInclude(results, {
			'fields[].registration.description': 'A test for us all',
		})
	}

	@test()
	protected static async canHandleBadFields() {
		const results = await this.copySchemasAndFieldsThenFetchFields(
			{
				localAddonsDir: this.resolvePath('src', 'addons'),
			},
			'field_registrations_one_bad'
		)

		assert.isLength(results.errors, 1)
		assert.doesInclude(results.errors[0].message, 'badField')
	}

	@test()
	protected static async wontLetYouSpecifyANamespaceNorVersion() {
		const results = await this.copySchemasAndFetchSchemas(
			{},
			'test_builders_with_namespace_and_version'
		)

		assert.isTruthy(results.errors)
		assert.isLength(results.errors, 2)

		errorAssert.assertError(results.errors[0], 'SCHEMA_FAILED_TO_IMPORT')
		errorAssert.assertError(results.errors[1], 'SCHEMA_FAILED_TO_IMPORT')

		results.errors = results.errors.sort((a, b) =>
			//@ts-ignore
			a.originalError.options.schemaId > b.originalError.options.schemaId
				? 1
				: -1
		)

		errorAssert.assertError(
			// @ts-ignore
			results.errors[0].originalError,
			// @ts-ignore
			'INVALID_SCHEMA',
			{
				schemaId: 'schemaWithNamespace',
				errors: ['namespace_should_not_be_set'],
			}
		)

		errorAssert.assertError(
			// @ts-ignore
			results.errors[1].originalError,
			// @ts-ignore
			'INVALID_SCHEMA',
			{
				schemaId: 'schemaWithVersion',
				errors: ['version_should_not_be_set'],
			}
		)
	}

	@test()
	protected static async emitsDidFetchEvent() {
		const cli = await this.installSchemaFeature('schemas')

		let wasFired = false

		await cli.on('schema.did-fetch-schemas', () => {
			wasFired = true
			return {}
		})

		await this.Store('schema').fetchSchemas({
			localNamespace: LOCAL_NAMESPACE,
		})

		assert.isTrue(wasFired)
	}

	@test()
	protected static async fetchEventPayloadIncludesAllOtherSchemas() {
		const cli = await this.installSchemaFeature('schemas')

		let emitPayload: any
		await cli.on('schema.did-fetch-schemas', (payload) => {
			emitPayload = payload
			return {}
		})

		await this.Store('schema').fetchSchemas({
			localNamespace: LOCAL_NAMESPACE,
		})

		for (const name in coreSchemas) {
			assert.doesInclude(
				emitPayload.schemas,
				//@ts-ignore
				normalizeSchemaToIdWithVersion(coreSchemas[name])
			)
		}
	}

	@test()
	protected static async canListenToFetchEventToDropInAdditionalSchemas() {
		const cli = await this.installSchemaFeature('schemas')

		await cli.on('schema.did-fetch-schemas', () => {
			return {
				schemas: [
					buildSchema({
						id: 'test',
						namespace: 'MyCoolNamespace',
						fields: {},
					}),
				],
			}
		})

		const results = await this.Store('schema').fetchSchemas({
			localNamespace: LOCAL_NAMESPACE,
		})

		assert.isLength(results.errors, 0)
		const { schemasByNamespace } = results

		assert.isTruthy(schemasByNamespace.MyCoolNamespace)
	}

	@test()
	protected static async multipleSchemasWithSameIdAndVersionReturnOnce() {
		const cli = await this.installSchemaFeature('schemas')

		await this.copySchemas()

		await cli.on('schema.did-fetch-schemas', () => {
			return {
				schemas: [
					{
						id: 'schemaOne',
						name: 'First schema',
						namespace: 'TestSkill',
						version: 'v2020_06_23',
						description: 'It is going to be great!',
						fields: {
							name: {
								type: 'text',
								isRequired: true,
							},
						},
					},
				],
			}
		})

		const results = await this.Store('schema').fetchSchemas({
			localNamespace: LOCAL_NAMESPACE,
		})

		assert.isLength(results.schemasByNamespace.TestSkill, 3)
	}

	private static validateSchemas(schemas: Schema[]) {
		for (const schema of schemas) {
			validateSchema(schema)
		}
	}

	private static async copySchemasAndFetchSchemas(
		options?: Record<string, any>,
		testBuilderDir = 'test_builders'
	) {
		await this.syncSchemas('schemas')

		await this.copySchemas(testBuilderDir)

		const results = await this.Store('schema').fetchSchemas({
			localNamespace: LOCAL_NAMESPACE,
			...(options || {}),
		})
		return results
	}

	private static async copySchemas(testBuilderDir = 'test_builders') {
		const schemasDir = this.resolvePath('src', 'schemas')
		await diskUtil.copyDir(this.resolveTestPath(testBuilderDir), schemasDir)
	}

	private static async copySchemasAndFieldsThenFetchFields(
		options?: Record<string, any>,
		registrationsDir = 'field_registrations'
	) {
		await this.syncSchemas('schemas')

		const addonsDir = this.resolvePath('src', 'addons')
		await diskUtil.copyDir(this.resolveTestPath(registrationsDir), addonsDir)

		const results = await this.Store('schema').fetchFields(options)
		return results
	}
}
