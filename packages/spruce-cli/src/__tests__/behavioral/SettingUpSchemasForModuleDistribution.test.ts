import { Schema, SchemaTemplateItem } from '@sprucelabs/schema'
import {
	diskUtil,
	namesUtil,
	versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { FeatureActionResponse } from '../../features/features.types'
import SchemaTemplateItemBuilder from '../../templateItemBuilders/SchemaTemplateItemBuilder'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import testUtil from '../../tests/utilities/test.utility'

const LOCAL_NAMESPACE = 'TestingSchemas'
const REMOTE_NAMESPACE = 'RemoteSchemas'

const REMOTE_MODULE = '@sprucelabs/spruce-calendar-utils'
const REMOTE_MODULE2 = '@sprucelabs/spruce-templates'

export default class SettingUpSchemasForModuleDistributionTest extends AbstractSkillTest {
	protected static skillCacheKey = 'schemas'
	private static builder1: Schema
	private static schema1: Schema
	private static schema2: Schema

	@test(
		'can specify importFromModuleWhenRemote 1',
		'CalendarEvent',
		REMOTE_MODULE,
		'1'
	)
	@test(
		'can specify importFromModuleWhenRemote 2',
		'CalendarEvent2',
		REMOTE_MODULE2,
		'2'
	)
	protected static async canSpecifyModuleToImportFromWhenRemote(
		namePascal: string,
		remoteModule: string,
		count: '1' | '2'
	) {
		const nameCamel = namesUtil.toCamel(namePascal)
		const promise = this.Action('schema', 'create').execute({
			nameReadable: 'Schema imported as module',
			namePascal,
			nameCamel,
			moduleToImportFromWhenRemote: remoteModule,
		})

		await this.wait(10)

		if (this.ui.isWaitingForInput()) {
			await this.ui.sendInput(versionUtil.generateVersion().constValue)
		}

		const results = await promise

		assert.isFalsy(results.errors)

		const builderFile = testUtil.assertFileByNameInGeneratedFiles(
			`${nameCamel}.builder.ts`,
			results.files
		)

		const builder = await this.Service('import').importDefault(builderFile)
		assert.isEqual(builder.moduleToImportFromWhenRemote, remoteModule)

		//@ts-ignore
		this[`builder${count}`] = builder

		const schemaFile = testUtil.assertFileByNameInGeneratedFiles(
			`${nameCamel}.schema.ts`,
			results.files
		)

		const schema = await this.Service('import').importDefault(schemaFile)
		assert.isEqual(schema.moduleToImportFromWhenRemote, remoteModule)

		//@ts-ignore
		this[`schema${count}`] = schema
	}

	@test()
	protected static async templateItemGeneratorHonorsModuleToImportWhenRemoteWhenInRemoteNamespace() {
		const templateItems = this.generateTemplateItems(REMOTE_NAMESPACE)

		for (const templateItem of templateItems) {
			assert.isEqual(
				templateItem.schema.moduleToImportFromWhenRemote,
				REMOTE_MODULE
			)
			assert.isEqual(templateItem.importFrom, REMOTE_MODULE)
		}
	}

	@test()
	protected static async moduleToImportWhenRemoteIgnoredWhenInSameNamespace() {
		const templateItems = this.generateTemplateItems(LOCAL_NAMESPACE)
		for (const templateItem of templateItems) {
			assert.isEqual(
				templateItem.schema.moduleToImportFromWhenRemote,
				REMOTE_MODULE
			)
			assert.isFalse('importFrom' in templateItem)
		}
	}

	@test(
		'should ask about missing module and cancel install',
		['schema1'],
		[REMOTE_MODULE],
		false
	)
	@test(
		'should ask about missing module and do install',
		['schema1'],
		[REMOTE_MODULE],
		true
	)
	@test(
		'should ask about missing module and do install',
		['schema1', 'schema2'],
		[REMOTE_MODULE, REMOTE_MODULE2],
		true
	)
	protected static async asksIfModuleShouldBeInstalled(
		schemaNames: ('schema1' | 'schema2')[],
		expectedModules: string[],
		shouldConfirmInstall: boolean
	) {
		await this.reInstallSkill()
		await this.Store('skill').setCurrentSkillsNamespace('TestingTwo')

		const schemas = schemaNames.map((name) => this[name])

		await this.getEmitter().on('schema.did-fetch-schemas', async () => {
			return {
				schemas,
			}
		})

		const promise = this.Action('schema', 'sync').execute({})

		await this.waitForInput()

		const secondToLast = this.ui.invocations[this.ui.invocations.length - 2]

		assert.isEqual(
			secondToLast.options.headline,
			`Missing ${expectedModules.length} module${
				expectedModules.length === 1 ? '' : 's'
			}`
		)

		for (const expected of expectedModules) {
			assert.doesInclude(secondToLast.options.lines, expected)
		}

		await this.ui.sendInput(shouldConfirmInstall ? 'y' : 'n')

		const results = await promise

		if (shouldConfirmInstall) {
			assert.isFalsy(results.errors)
			const pkg = this.Service('pkg')
			for (const expected of expectedModules) {
				assert.isTrue(pkg.isInstalled(expected))
			}
		} else {
			assert.isTruthy(results.errors)
			errorAssertUtil.assertError(results.errors[0], 'ACTION_CANCELLED')
		}
	}

	@test('schemas are imported from one module', ['schema1'])
	@test('schemas are imported from two modules', ['schema1', 'schema2'])
	protected static async schemasAreImportedFromModuleWhenSyncedFormDifferentNamespace(
		schemaNames: ('schema1' | 'schema2')[]
	) {
		await this.reInstallSkill()
		await this.Store('skill').setCurrentSkillsNamespace('TestingTwo')

		const schemas: Schema[] = []

		for (const name of schemaNames) {
			schemas.push(this[name])
		}

		await this.getEmitter().on('schema.did-fetch-schemas', async () => {
			return {
				schemas,
			}
		})

		const results = await this.Action('schema', 'sync').execute({
			shouldInstallMissingDependencies: true,
		})

		await this.assertCalendarEventSchemaIsImported(results)
		assert.doesThrow(() =>
			testUtil.assertFileByNameInGeneratedFiles(
				'schemas.types.ts',
				results.files
			)
		)
	}

	@test('can reference impored from another module', [
		`import * as HeartwoodTypesLocal from '@sprucelabs/heartwood-view-controllers'`,
	])
	@test('can reference impored from another module with two importsWhenLocal', [
		`import * as HeartwoodTypesLocal from '@sprucelabs/heartwood-view-controllers'`,
		`import * as HeartwoodTypesLocal2 from '@sprucelabs/heartwood-view-controllers'`,
	])
	protected static async canReferenceSchemaImportedFromAnotherModule(
		importsWhenRemote: string[]
	) {
		await this.reInstallSkill()
		await this.Store('skill').setCurrentSkillsNamespace('TestingTwo')

		const mySchema = {
			id: 'localSchema',
			importsWhenRemote,
			fields: {
				calendarEvent: {
					type: 'schema',
					options: {
						schema: {
							...this.schema1,
							namespace: 'CalendarUtils',
							version: 'v2021_05_19',
						},
					},
				},
			},
		}

		await this.getEmitter().on('schema.did-fetch-schemas', async () => {
			return {
				schemas: [mySchema],
			}
		})

		const results = await this.Action('schema', 'sync').execute({
			shouldInstallMissingDependencies: true,
		})

		const localSchemaFile = testUtil.assertFileByNameInGeneratedFiles(
			'localSchema.schema.ts',
			results.files
		)

		const localSchema = await this.Service('import').importDefault(
			localSchemaFile
		)

		assert.isEqualDeep(localSchema.importsWhenRemote, importsWhenRemote)

		await this.assertCalendarEventSchemaIsImported(results)
		await this.assertValidTypesFile(results)
	}

	@test()
	protected static async canSetImportFromModuleWithNestedSchemasWhenRemoteWhenSyncing() {
		await this.reInstallSkill()

		await this.Action('schema', 'create').execute({
			nameReadable: 'Schema imported as module',
			namePascal: 'CalandarEvent',
			nameCamel: 'calendarEvent',
		})

		const results = await this.Action('schema', 'sync').execute({
			moduleToImportFromWhenRemote: REMOTE_MODULE,
		})

		this.schema1 = (await this.importGeneratedFile(
			results,
			`calendarEvent.schema.ts`
		)) as Schema

		assert.isEqual(this.schema1.moduleToImportFromWhenRemote, REMOTE_MODULE)
	}

	@test()
	protected static async canHandleFormBuilderImportExportObject() {
		const version = versionUtil.generateVersion().constValue

		const completedFormBuilder = {
			id: 'fullCompletedForm',
			version,
			moduleToImportFromWhenRemote: '@sprucelabs/heartwood-view-controllers',
			fields: {
				id: {
					type: 'id',
					isRequired: true,
				},
				personId: {
					type: 'id',
					isRequired: true,
				},
				values: {
					type: 'raw',
					isArray: true,
					options: {
						valueType: 'Record<string, any>',
					},
				},
			},
		}

		const builderForm = {
			id: 'builtForm',
			version,
			moduleToImportFromWhenRemote: '@sprucelabs/heartwood-view-controllers',
			fields: {
				id: {
					type: 'id',
					isRequired: true,
				},
				dateDeleted: {
					type: 'number',
				},
				completedFormBuilder: {
					type: 'schema',
					options: {
						schemaId: {
							version,
							id: 'fullCompletedForm',
						},
					},
				},
			},
		}

		const itemBuilder = new SchemaTemplateItemBuilder('TestSkill')

		const results = itemBuilder.buildTemplateItems({
			//@ts-ignore
			TestSkill: [completedFormBuilder, builderForm],
		})

		assert.isFalsy(
			//@ts-ignore
			results.find((r) => r.id === 'builtForm')?.schema.fields
				?.completedFormBuilder?.options?.schemaIds?.[0]
				?.moduleToImportFromWhenRemote
		)
	}

	private static async importGeneratedFile(
		results: FeatureActionResponse,
		fileName: string
	) {
		const schemaFile = testUtil.assertFileByNameInGeneratedFiles(
			fileName,
			results.files
		)

		return await this.Service('import').importDefault(schemaFile)
	}

	private static async assertCalendarEventSchemaIsImported(
		results: FeatureActionResponse
	) {
		assert.isFalsy(results.errors)

		const imported = testUtil.assertFileByNameInGeneratedFiles(
			'calendarEvent.schema.ts',
			results.files
		)

		const calendarEventContents = diskUtil.readFile(imported)

		assert.isEqual(
			calendarEventContents.trim(),
			`export { calendarEventSchema as default } from '@sprucelabs/spruce-calendar-utils'`
		)
	}

	private static generateTemplateItems(namespace: string) {
		const itemBuilder = new SchemaTemplateItemBuilder(namespace)
		const templateItems = itemBuilder.buildTemplateItems(
			{
				[LOCAL_NAMESPACE]: [
					{
						...this.builder1,
						fields: {
							...this.builder1.fields,
							nestedSchema: {
								type: 'schema',
								options: {
									schema: {
										id: 'nested',
										fields: {
											firstName: {
												type: 'text',
											},
										},
									},
								},
							},
						},
					},
				],
			},
			this.resolveHashSprucePath('schemas')
		)
		return templateItems as SchemaTemplateItem[]
	}

	private static async assertValidTypesFile(results: FeatureActionResponse) {
		const schemaTypesFile = testUtil.assertFileByNameInGeneratedFiles(
			'schemas.types.ts',
			results.files
		)

		const typesContent = `import '${REMOTE_MODULE}'\n\n${diskUtil.readFile(
			schemaTypesFile
		)}`
		diskUtil.writeFile(schemaTypesFile, typesContent)

		await this.Service('typeChecker').check(schemaTypesFile)
	}
}
