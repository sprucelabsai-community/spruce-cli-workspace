import pathUtil from 'path'
import { Schema, SchemaError, SchemaTemplateItem } from '@sprucelabs/schema'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import schemaGeneratorUtil from './schemaGenerator.utility'

const schemaDiskUtil = {
	resolvePath(options: {
		destination: string
		schema: Schema
		shouldIncludeFileExtension?: boolean
	}) {
		const {
			destination,
			schema,
			shouldIncludeFileExtension: includeFileExtension,
		} = options

		if (!schema.namespace) {
			throw new SchemaError({
				code: 'MISSING_PARAMETERS',
				parameters: ['namespace'],
			})
		}

		return pathUtil.join(
			destination,
			namesUtil.toCamel(schema.namespace),
			schema.version ?? '',
			`${schema.id}.schema${includeFileExtension === false ? '' : '.ts'}`
		)
	},

	resolveTypeFilePaths(options: {
		cwd: string
		generateStandaloneTypesFile: boolean
		schemaTypesDestinationDirOrFile: string
		fieldTypesDestinationDir: string
	}) {
		const {
			cwd,
			generateStandaloneTypesFile,
			schemaTypesDestinationDirOrFile,
			fieldTypesDestinationDir,
		} = options

		const resolvedSchemaTypesDestination = diskUtil.resolvePath(
			cwd,
			generateStandaloneTypesFile &&
				diskUtil.isDirPath(schemaTypesDestinationDirOrFile)
				? diskUtil.resolvePath(
						cwd,
						schemaTypesDestinationDirOrFile,
						'core.schemas.types.ts'
					)
				: schemaTypesDestinationDirOrFile
		)

		const resolvedSchemaTypesDestinationDirOrFile = diskUtil.isDirPath(
			resolvedSchemaTypesDestination
		)
			? resolvedSchemaTypesDestination
			: pathUtil.dirname(resolvedSchemaTypesDestination)

		const resolvedFieldTypesDestination = diskUtil.resolvePath(
			cwd,
			fieldTypesDestinationDir ?? resolvedSchemaTypesDestinationDirOrFile
		)

		return {
			resolvedFieldTypesDestination,
			resolvedSchemaTypesDestinationDirOrFile,
			resolvedSchemaTypesDestination,
		}
	},

	async deleteOrphanedSchemas(
		resolvedDestination: string,
		schemaTemplateItems: SchemaTemplateItem[]
	) {
		const definitionsToDelete =
			await schemaGeneratorUtil.filterSchemaFilesBySchemaIds(
				resolvedDestination,
				schemaTemplateItems.map((item) => ({
					...item,
					version: item.schema.version,
				}))
			)

		definitionsToDelete.forEach((def) => diskUtil.deleteFile(def))
	},
}

export default schemaDiskUtil
