import path from 'path'
import pathUtil from 'path'
import { IFieldTemplateItem, ISchemaTemplateItem } from '@sprucelabs/schema'
import { CORE_NAMESPACE, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { LATEST_HANDLEBARS } from '@sprucelabs/spruce-skill-utils'
import {
	ISchemaBuilderTemplateItem,
	IValueTypes,
} from '@sprucelabs/spruce-templates'
import SpruceError from '../errors/SpruceError'
import AbstractGenerator, { GenerationResults } from './AbstractGenerator'

export interface IGenerateSchemaTypesOptions {
	fieldTemplateItems: IFieldTemplateItem[]
	schemaTemplateItems: ISchemaTemplateItem[]
}

export interface IGenerateFieldTypesOptions {
	fieldTemplateItems: IFieldTemplateItem[]
}

// eslint-disable-next-line no-redeclare
export interface IGenerateSchemaTypesOptions {
	fieldTemplateItems: IFieldTemplateItem[]
	schemaTemplateItems: ISchemaTemplateItem[]
	valueTypes: IValueTypes
	globalNamespace?: string
	typesTemplate?: string
	registerBuiltSchemas?: boolean
	shouldImportCoreSchemas: boolean
}

export interface ISchemaTypesGenerationStage {
	name: string
	errors: SpruceError[]
	successfulSchemas: number
	successfulFields: number
}
export default class SchemaGenerator extends AbstractGenerator {
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

	public async generateBuilder(
		destinationDir: string,
		options: ISchemaBuilderTemplateItem & {
			enableVersioning?: boolean
			version?: string
		}
	): Promise<GenerationResults> {
		const filename = `${options.nameCamel}.builder.ts`

		const resolvedBuilderDestination =
			options.enableVersioning === false
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
			'The source of truth for generating your schema and associated types.'
		)

		return results
	}

	public async generateFieldTypes(
		destinationDir: string,
		options: IGenerateFieldTypesOptions
	): Promise<GenerationResults> {
		const { fieldTemplateItems } = options

		let results: GenerationResults = []

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

	public async generateSchemasAndTypes(
		destinationDirOrFilename: string,
		options: IGenerateSchemaTypesOptions
	): Promise<GenerationResults> {
		const {
			fieldTemplateItems,
			schemaTemplateItems,
			valueTypes,
			typesTemplate,
		} = options

		const resolvedTypesDestination = this.resolveFilenameWithFallback(
			destinationDirOrFilename,
			'schemas.types.ts'
		)

		let results: GenerationResults = []

		const schemaTypesContents = this.templates.schemasTypes({
			schemaTemplateItems,
			fieldTemplateItems,
			valueTypes,
			globalNamespace: options.globalNamespace,
			typesTemplate,
		})

		results = await this.writeFileIfChangedMixinResults(
			resolvedTypesDestination,
			schemaTypesContents,
			'Namespace for accessing all your schemas. Type `SpruceSchemas` in your IDE to get started. ⚡️'
		)

		const allSchemaResults = await this.generateAllSchemas(
			pathUtil.dirname(resolvedTypesDestination),
			{
				...options,
				typesFile: resolvedTypesDestination,
			}
		)

		results.push(...allSchemaResults)

		return results
	}

	private async generateAllSchemas(
		destinationDir: string,
		options: IGenerateSchemaTypesOptions & { typesFile?: string }
	): Promise<GenerationResults> {
		const results: GenerationResults = []

		for (const item of options.schemaTemplateItems) {
			const schemaResults = await this.generateSchema(destinationDir, {
				...options,
				...item,
			})
			results.push(...schemaResults)
		}

		return results
	}

	public async generateSchema(
		destinationDir: string,
		options: {
			schemaTemplateItems: ISchemaTemplateItem[]
			fieldTemplateItems: IFieldTemplateItem[]
			valueTypes: IValueTypes
			typesFile?: string
			registerBuiltSchemas?: boolean
			shouldImportCoreSchemas?: boolean
		} & ISchemaTemplateItem
	) {
		const {
			schemaTemplateItems,
			fieldTemplateItems,
			valueTypes,
			registerBuiltSchemas = true,
			shouldImportCoreSchemas,
			...item
		} = options

		const resolvedDestination = path.join(
			destinationDir,
			namesUtil.toCamel(options.namespace),
			options.schema.version ?? '',
			`${item.id}.schema.ts`
		)

		let typesFile = options.typesFile
			? pathUtil.relative(
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
				item.namespace === CORE_NAMESPACE && shouldImportCoreSchemas
					? `schemas/imported.schema.ts.hbs`
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

	public async generateValueTypes(
		destinationDir: string,
		options: {
			schemaTemplateItems: ISchemaTemplateItem[]
			fieldTemplateItems: IFieldTemplateItem[]
			globalNamespace?: string
		}
	): Promise<GenerationResults> {
		const contents = this.templates.valueTypes(options)
		const destination = pathUtil.join(destinationDir, 'tmp', 'valueType.tmp.ts')

		return this.writeFileIfChangedMixinResults(
			destination,
			contents,
			'For constructing what goes to the right of the : after each property in the interface.'
		)
	}
}
