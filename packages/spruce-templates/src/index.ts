import fs from 'fs'
import path from 'path'
import {
	Schema,
	SchemaTemplateItem,
	FieldTemplateItem,
} from '@sprucelabs/schema'
import { TemplateRenderAs } from '@sprucelabs/schema'
import {
	addonUtil,
	SCHEMA_VERSION_FALLBACK,
	DEFAULT_GLOBAL_SCHEMA_NAMESPACE,
	DEFAULT_BUILDER_FUNCTION,
	DEFAULT_SCHEMA_TYPES_FILE,
} from '@sprucelabs/spruce-skill-utils'
import handlebars from 'handlebars'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'
import {
	DirectoryTemplateCode,
	DirectoryTemplateContextMap,
	ValueTypes,
	SchemaBuilderTemplateItem,
	ErrorOptions,
	ErrorTemplateItem,
	TestOptions,
	EventListenerOptions,
	EventContractTemplateItem,
	EventPayloadOptions,
	StoreTemplateOptions,
	StoreTemplateItem,
} from './types/templates.types'
import DirectoryTemplateUtility from './utilities/DirectoryTemplateUtility'
import importExtractorUtil from './utilities/importExtractor.utility'
import KeyGeneratorUtility from './utilities/KeyGeneratorUtility'
import templateImportUtil from './utilities/templateImporter.utility'
import templateItemUtil from './utilities/templateItem.utility'

addonUtil.importSync({}, __dirname, 'addons')

export const templates = {
	schemasTypes(options: {
		schemaTemplateItems: SchemaTemplateItem[]
		fieldTemplateItems: FieldTemplateItem[]
		valueTypes: ValueTypes
		globalSchemaNamespace?: string
		typesTemplate?: string
	}) {
		const imports = importExtractorUtil.extractFieldImports(
			options.fieldTemplateItems
		)
		const template = templateImportUtil.getTemplate(
			options.typesTemplate ?? 'schema/schemas.types.ts.hbs'
		)

		const schemaImports = importExtractorUtil.extractSchemaImports(
			options.schemaTemplateItems
		)

		return template({
			...options,
			imports,
			schemaImports,
			globalSchemaNamespace:
				options.globalSchemaNamespace ?? DEFAULT_GLOBAL_SCHEMA_NAMESPACE,
		})
	},

	valueTypes(options: {
		schemaTemplateItems: SchemaTemplateItem[]
		fieldTemplateItems: FieldTemplateItem[]
		globalSchemaNamespace?: string
	}) {
		const imports = importExtractorUtil.extractFieldImports(
			options.fieldTemplateItems
		)
		const rendersAs = Object.values(TemplateRenderAs)

		const schemaTemplatesByNamespaceAndName = templateItemUtil.groupSchemaTemplatesByNamespaceAndName(
			options.schemaTemplateItems
		)

		const fieldTemplatesByType = templateItemUtil.groupFieldItemsByNamespace(
			options.fieldTemplateItems
		)

		const template = templateImportUtil.getTemplate('schema/valueTypes.ts.hbs')

		return template({
			...options,
			imports,
			fieldTemplatesByType,
			schemaTemplatesByNamespaceAndName,
			SCHEMA_VERSION_FALLBACK,
			rendersAs,
			globalSchemaNamespace:
				options.globalSchemaNamespace ?? DEFAULT_GLOBAL_SCHEMA_NAMESPACE,
		})
	},

	schema(
		options: SchemaTemplateItem & {
			schemaTemplateItems: SchemaTemplateItem[]
			fieldTemplateItems: FieldTemplateItem[]
			valueTypes: ValueTypes
			globalSchemaNamespace?: string
			registerBuiltSchemas: boolean
			schemaFile?: string
			typesFile?: string
		}
	) {
		const imports = importExtractorUtil.extractFieldImports(
			options.fieldTemplateItems
		)
		const template = templateImportUtil.getTemplate(
			options.schemaFile ?? 'schema/schema.ts.hbs'
		)

		return template({
			...options,
			imports,
			globalSchemaNamespace:
				options.globalSchemaNamespace ?? DEFAULT_GLOBAL_SCHEMA_NAMESPACE,
			typesFile: options.typesFile ?? DEFAULT_SCHEMA_TYPES_FILE,
		})
	},

	schemaBuilder(options: SchemaBuilderTemplateItem) {
		const template = templateImportUtil.getTemplate('schema/builder.ts.hbs')
		return template({
			...options,
			builderFunction: options.builderFunction ?? DEFAULT_BUILDER_FUNCTION,
		})
	},

	error(options: ErrorOptions) {
		const template = templateImportUtil.getTemplate('error/SpruceError.ts.hbs')
		return template({ renderClassDefinition: true, ...options })
	},

	errorOptionsTypes(options: { options: ErrorTemplateItem[] }) {
		const template = templateImportUtil.getTemplate(
			'error/options.types.ts.hbs'
		)
		return template(options)
	},

	schemaExample(options: {
		nameCamel: string
		namePascal: string
		definition: Schema
	}) {
		const template = templateImportUtil.getTemplate('schema/example.ts.hbs')
		return template(options)
	},

	schemaPlugin() {
		const template = templateImportUtil.getTemplate(
			'schema/schema.plugin.ts.hbs'
		)
		return template({})
	},

	errorPlugin() {
		const template = templateImportUtil.getTemplate('error/error.plugin.ts.hbs')
		return template({})
	},

	conversationPlugin() {
		const template = templateImportUtil.getTemplate(
			'conversation/conversation.plugin.ts.hbs'
		)
		return template({})
	},

	deployPlugin() {
		const template = templateImportUtil.getTemplate(
			'deploy/deploy.plugin.ts.hbs'
		)
		return template({})
	},

	errorExample(options: {
		nameCamel: string
		namePascal: string
		definition: Schema
	}) {
		const template = templateImportUtil.getTemplate('error/example.ts.hbs')
		return template(options)
	},

	test(options: TestOptions) {
		const template = templateImportUtil.getTemplate('test/Test.test.ts.hbs')
		return template(options)
	},

	fieldsTypes(options: { fieldTemplateItems: FieldTemplateItem[] }) {
		const template = templateImportUtil.getTemplate(
			'schema/fields/fields.types.ts.hbs'
		)
		return template(options)
	},

	fieldClassMap(options: { fieldTemplateItems: FieldTemplateItem[] }) {
		const template = templateImportUtil.getTemplate(
			'schema/fields/fieldClassMap.ts.hbs'
		)
		return template(options)
	},

	launchConfig() {
		const template = templateImportUtil.getTemplate('vscode/launch.json')
		return template({})
	},

	vsCodeSettings() {
		const template = templateImportUtil.getTemplate('vscode/settings.json')
		return template({})
	},

	listener(options: EventListenerOptions) {
		const template = templateImportUtil.getTemplate('event/listener.ts.hbs')
		return template({
			globalSchemaNamespace: DEFAULT_GLOBAL_SCHEMA_NAMESPACE,
			...options,
		})
	},

	eventContract(
		options: EventContractTemplateItem & {
			schemaTemplateItems: SchemaTemplateItem[]
		}
	) {
		const template = templateImportUtil.getTemplate(
			'event/event.contract.ts.hbs'
		)

		return template(options)
	},

	permissionContractBuilder(options: {
		nameCamel: string
		nameReadable: string
	}) {
		const template = templateImportUtil.getTemplate(
			'permissions/contract.builder.ts.hbs'
		)

		return template(options)
	},

	eventEmitPayload(options: EventPayloadOptions) {
		const template = templateImportUtil.getTemplate(
			'event/payload.builder.ts.hbs'
		)

		return template({ ...options, actionCamel: 'Emit' })
	},

	eventResponsePayload(options: EventPayloadOptions) {
		const template = templateImportUtil.getTemplate(
			'event/payload.builder.ts.hbs'
		)

		return template({ ...options, actionCamel: 'Response' })
	},

	combinedEventsContract(contracts: EventContractTemplateItem[]) {
		const template = templateImportUtil.getTemplate(
			'event/events.contract.ts.hbs'
		)
		return template({ contracts })
	},

	sandboxWillBootListener() {
		const template = templateImportUtil.getTemplate(
			'sandbox/will-boot.listener.ts.hbs'
		)
		return template({})
	},

	async directoryTemplate<K extends DirectoryTemplateCode>(options: {
		kind: K
		context: DirectoryTemplateContextMap[K]
	}) {
		return DirectoryTemplateUtility.build(options)
	},

	async isValidTemplatedDirectory(options: {
		kind: DirectoryTemplateCode
		dir: string
	}) {
		const { kind, dir } = options

		if (kind === DirectoryTemplateCode.Skill) {
			return fs.existsSync(path.join(dir, 'package.json'))
		}

		const filesToCheck = await DirectoryTemplateUtility.filesInTemplate(kind)

		let filesMissing = false
		for (let i = 0; i < filesToCheck.length; i += 1) {
			const file = filesToCheck[i].path

			if (!fs.existsSync(file)) {
				filesMissing = true
				break
			}
		}

		if (!filesMissing) {
			return true
		}

		return false
	},

	conversationTopic(options: { nameReadable: string }) {
		const template = templateImportUtil.getTemplate(
			'conversation/conversation.topic.ts.hbs'
		)
		return template(options)
	},

	generateFieldKey(renderAs: TemplateRenderAs, definition: FieldDefinitions) {
		return KeyGeneratorUtility.generateFieldKey(renderAs, definition)
	},

	storePlugin() {
		const template = templateImportUtil.getTemplate('store/store.plugin.ts.hbs')
		return template({})
	},

	store(options: StoreTemplateOptions) {
		const template = templateImportUtil.getTemplate('store/Store.Store.ts.hbs')
		return template(options)
	},

	storeTypes(options: { stores: StoreTemplateItem[] }) {
		const template = templateImportUtil.getTemplate('store/store.types.ts.hbs')
		return template(options)
	},
}

export type Templates = typeof templates
export { default as importExtractor } from './utilities/importExtractor.utility'

export default handlebars
export * from './types/templates.types'
