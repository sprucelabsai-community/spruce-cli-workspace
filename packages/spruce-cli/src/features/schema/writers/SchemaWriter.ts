import path from 'path'
import pathUtil from 'path'
import { FieldTemplateItem, SchemaTemplateItem } from '@sprucelabs/schema'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import {
	LATEST_HANDLEBARS,
	DEFAULT_SCHEMA_TYPES_FILENAME,
} from '@sprucelabs/spruce-skill-utils'
import {
	SchemaBuilderTemplateItem,
	ValueTypes,
} from '@sprucelabs/spruce-templates'
import SpruceError from '../../../errors/SpruceError'
import AbstractWriter, { WriteResults } from '../../../writers/AbstractWriter'
import schemaDiskUtil from '../utilities/schemaDisk.utility'

export default class SchemaWriter extends AbstractWriter {
	private readonly fieldTemplates: {
		filename: string
		templateFuncName: 'fieldsTypes' | 'fieldClassMap'
		description: string
	}[] = [
		{
			filename: 'fields.types.ts',
			templateFuncName: 'fieldsTypes',
			description:
				'All the interfaces generated for every type of schema field (text, number, address, etc).',
		},
		{
			filename: 'fieldClassMap.ts',
			templateFuncName: 'fieldClassMap',
			description:
				'An object that is injected into the FieldFactory and ensures 3rd party fields are integrated.',
		},
	]

	public async writeBuilder(
		destinationDir: string,
		options: SchemaBuilderTemplateItem & {
			shouldEnableVersioning?: boolean
			version?: string
		}
	): Promise<WriteResults> {
		this.ui.startLoading('Writing builder...')

		const filename = `${options.nameCamel}.builder.ts`

		const resolvedBuilderDestination =
			options.shouldEnableVersioning === false
				? pathUtil.resolve(destinationDir, filename)
				: versionUtil.resolveNewLatestPath(
						destinationDir,
						options.version ?? LATEST_HANDLEBARS,
						filename
					)

		if (diskUtil.doesFileExist(resolvedBuilderDestination)) {
			throw new SpruceError({
				code: 'SCHEMA_EXISTS',
				schemaId: options.nameCamel,
				destination: destinationDir,
			})
		}

		const builderContent = this.templates.schemaBuilder(options)

		const results = await this.writeFileIfChangedMixinResults(
			resolvedBuilderDestination,
			builderContent,
			'The source of truth for building your schemas and their types. Run spruce sync.errors when you change this.'
		)

		await this.lint(resolvedBuilderDestination)

		return results
	}

	public async writeFieldTypes(
		destinationDir: string,
		options: WriteFieldTypesOptions
	): Promise<WriteResults> {
		this.ui.startLoading('Checking schema field types...')

		const { fieldTemplateItems } = options

		let results: WriteResults = []

		for (const fileAndFunc of this.fieldTemplates) {
			const { filename, templateFuncName, description } = fileAndFunc

			const resolvedDestination = path.join(destinationDir, 'fields', filename)

			const contents = this.templates[templateFuncName]({
				fieldTemplateItems,
			})

			results = await this.writeFileIfChangedMixinResults(
				resolvedDestination,
				contents,
				description,
				results
			)
		}

		return results
	}

	public async writeSchemasAndTypes(
		destinationDirOrFilename: string,
		options: GenerateSchemaTypesOptions
	): Promise<WriteResults> {
		const {
			fieldTemplateItems,
			schemaTemplateItems,
			valueTypes,
			typesTemplate,
		} = options

		const resolvedTypesDestination = this.resolveFilenameWithFallback(
			destinationDirOrFilename,
			DEFAULT_SCHEMA_TYPES_FILENAME
		)

		let results: WriteResults = []
		this.ui.startLoading('Generating schema types...')

		const localItems = schemaTemplateItems.filter((i) => !i.importFrom)

		if (localItems.length > 0) {
			const schemaTypesContents = this.templates.schemasTypes({
				schemaTemplateItems: localItems,
				fieldTemplateItems,
				valueTypes,
				globalSchemaNamespace: options.globalSchemaNamespace,
				typesTemplate,
			})

			results = await this.writeFileIfChangedMixinResults(
				resolvedTypesDestination,
				schemaTypesContents,
				'Namespace for accessing all your schemas. Type `SpruceSchemas` in your IDE to get started. ⚡️'
			)

			await this.lint(resolvedTypesDestination)
		}

		this.ui.startLoading(
			`Checking ${schemaTemplateItems.length} schemas for changes...`
		)

		const allSchemaResults = await this.writeAllSchemas(
			pathUtil.dirname(resolvedTypesDestination),
			{
				...options,
				typesFile: resolvedTypesDestination,
			}
		)

		results.push(...allSchemaResults)

		return results
	}

	private async writeAllSchemas(
		destinationDir: string,
		options: GenerateSchemaTypesOptions & { typesFile?: string }
	): Promise<WriteResults> {
		const results: WriteResults = []

		for (const item of options.schemaTemplateItems) {
			const schemaResults = await this.writeSchema(destinationDir, {
				...options,
				...item,
			})
			results.push(...schemaResults)
		}

		return results
	}

	public async writeSchema(
		destinationDir: string,
		options: {
			schemaTemplateItems: SchemaTemplateItem[]
			fieldTemplateItems: FieldTemplateItem[]
			valueTypes: ValueTypes
			typesFile?: string
			registerBuiltSchemas?: boolean
			shouldImportCoreSchemas: boolean
		} & SchemaTemplateItem
	) {
		const {
			schemaTemplateItems,
			fieldTemplateItems,
			valueTypes,
			registerBuiltSchemas = true,
			...item
		} = options

		const resolvedDestination = schemaDiskUtil.resolvePath({
			destination: destinationDir,
			schema: options.schema,
		})

		let typesFile = options.typesFile
			? diskUtil.resolveRelativePath(
					pathUtil.dirname(resolvedDestination),
					options.typesFile
				)
			: undefined

		if (typesFile) {
			typesFile = typesFile.replace(pathUtil.extname(typesFile), '')
		}

		const schemaContents = this.templates.schema({
			...item,
			registerBuiltSchemas,
			schemaTemplateItems,
			fieldTemplateItems,
			valueTypes,
			typesFile,
			schemaFile:
				item.importFrom && options.shouldImportCoreSchemas
					? `schema/imported.schema.ts.hbs`
					: undefined,
		})

		return this.writeFileIfChangedMixinResults(
			resolvedDestination,
			schemaContents,
			`${
				item.schema.description ? `${item.schema.description} ` : ''
			}This is the schema generated by ${
				item.id
			}.builder.ts. AUTOGENERATED. DO NOT EDIT.`
		)
	}

	public async writeValueTypes(
		destinationDir: string,
		options: {
			schemaTemplateItems: SchemaTemplateItem[]
			fieldTemplateItems: FieldTemplateItem[]
			globalSchemaNamespace?: string
		}
	): Promise<WriteResults> {
		const contents = this.templates.valueTypes(options)
		const destination = pathUtil.join(destinationDir, 'tmp', 'valueType.tmp.ts')

		return this.writeFileIfChangedMixinResults(
			destination,
			contents,
			'For constructing what goes to the right of the : after each property in the interface.'
		)
	}

	public writePlugin(cwd: string) {
		const destination = diskUtil.resolveHashSprucePath(
			cwd,
			'features',
			'schema.plugin.ts'
		)

		const pluginContents = this.templates.schemaPlugin()

		const results = this.writeFileIfChangedMixinResults(
			destination,
			pluginContents,
			'Enable schema support in your skill.'
		)

		return results
	}
}

interface WriteFieldTypesOptions {
	fieldTemplateItems: FieldTemplateItem[]
}

export interface GenerateSchemaTypesOptions {
	fieldTemplateItems: FieldTemplateItem[]
	schemaTemplateItems: SchemaTemplateItem[]
	valueTypes: ValueTypes
	globalSchemaNamespace?: string
	typesTemplate?: string
	registerBuiltSchemas?: boolean
	shouldImportCoreSchemas: boolean
}
