import fs from 'fs'
import path from 'path'
import { PermissionContractMap } from '@sprucelabs/mercury-types'
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
	ViewsOptions,
	ListenerTemplateItem,
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

		const schemaTemplatesByNamespaceAndName =
			templateItemUtil.groupSchemaTemplatesByNamespaceAndName(
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
			shouldImportGlobalSchema:
				options.emitPayloadSchemaTemplateItem ||
				options.responsePayloadSchemaTemplateItem,
		})
	},

	listeners(options: { listeners: ListenerTemplateItem[] }) {
		const template = templateImportUtil.getTemplate('event/listeners.ts.hbs')
		return template({
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

	eventOptions(options: { isGlobal: boolean }) {
		const template = templateImportUtil.getTemplate(
			'event/event.options.ts.hbs'
		)

		return template({
			...options,
			isGlobal: options.isGlobal ? 'true' : 'false',
		})
	},

	permissionPlugin() {
		const template = templateImportUtil.getTemplate(
			'permissions/permission.plugin.ts.hbs'
		)
		return template({})
	},

	permissions(options: { contracts: { path: string; nameCamel: string }[] }) {
		const template = templateImportUtil.getTemplate(
			'permissions/permissions.ts.hbs'
		)

		return template({ ...options })
	},

	permissionContractBuilder(options: {
		nameCamel: string
		nameKebab: string
		nameReadable: string
		description?: string
	}) {
		const template = templateImportUtil.getTemplate(
			'permissions/contract.builder.ts.hbs'
		)

		return template(options)
	},

	permissionTypes(options: { contracts: PermissionContractMap }) {
		const template = templateImportUtil.getTemplate(
			'permissions/permissions.types.ts.hbs'
		)

		return template(options)
	},

	eventEmitPayload(options: EventPayloadOptions) {
		const template = templateImportUtil.getTemplate(
			'event/payload.builder.ts.hbs'
		)

		return template({ ...options, actionCamel: 'EmitPayload' })
	},

	eventEmitTarget(options: EventPayloadOptions) {
		const template = templateImportUtil.getTemplate(
			'event/payload.builder.ts.hbs'
		)

		return template({ ...options, actionCamel: 'EmitTarget' })
	},

	eventResponsePayload(options: EventPayloadOptions) {
		const template = templateImportUtil.getTemplate(
			'event/payload.builder.ts.hbs'
		)

		return template({ ...options, actionCamel: 'ResponsePayload' })
	},

	combinedEventsContract(options: {
		templateItems: EventContractTemplateItem[]
		shouldImportCoreEvents?: boolean
		skillEventContractTypesFile: string
	}) {
		const template = templateImportUtil.getTemplate(
			'event/events.contract.ts.hbs'
		)
		return template({ ...options, contracts: options.templateItems })
	},

	sandboxWillBootListener() {
		const template = templateImportUtil.getTemplate(
			'sandbox/will-boot.listener.ts.hbs'
		)
		return template({})
	},

	polish() {
		const template = templateImportUtil.getTemplate('polish/polish.ts.hbs')
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
		const template = templateImportUtil.getTemplate('store/Store.store.ts.hbs')
		return template(options)
	},

	storeTypes(options: { stores: StoreTemplateItem[] }) {
		const template = templateImportUtil.getTemplate('store/stores.types.ts.hbs')
		return template(options)
	},
	stores(options: { stores: StoreTemplateItem[] }) {
		const template = templateImportUtil.getTemplate('store/stores.ts.hbs')
		return template(options)
	},

	skillViewController(options: { namePascal: string; nameKebab: string }) {
		const template = templateImportUtil.getTemplate('view/View.svc.ts.hbs')
		return template(options)
	},

	viewController(options: {
		viewModel: string
		namePascal: string
		nameKebab: string
	}) {
		const template = templateImportUtil.getTemplate('view/View.vc.ts.hbs')
		return template(options)
	},

	views(options: ViewsOptions) {
		const template = templateImportUtil.getTemplate('view/views.ts.hbs')
		return template(options)
	},

	viewPlugin() {
		const template = templateImportUtil.getTemplate('view/view.plugin.ts.hbs')
		return template({})
	},

	viewControllerPlugin(options: { namePascal: string; nameCamel: string }) {
		const template = templateImportUtil.getTemplate(
			'view/viewController.plugin.ts.hbs'
		)
		return template(options)
	},

	theme() {
		const template = templateImportUtil.getTemplate('view/skill.theme.ts.hbs')
		return template({})
	},

	logTransport() {
		const template = templateImportUtil.getTemplate(
			'log/transport.plugin.ts.hbs'
		)
		return template({})
	},
}

export type Templates = typeof templates
export { default as importExtractorUtil } from './utilities/importExtractor.utility'

export default handlebars
export * from './types/templates.types'
