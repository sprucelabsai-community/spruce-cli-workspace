import pathUtil from 'path'
import { Schema, SchemaError, SchemaTemplateItem } from '@sprucelabs/schema'
import {
    diskUtil,
    namesUtil,
    ProjectLanguage,
} from '@sprucelabs/spruce-skill-utils'
import schemaGeneratorUtil from './schemaGenerator.utility'

const schemaDiskUtil = {
    resolvePath(options: {
        destination: string
        schema: Schema
        shouldIncludeFileExtension?: boolean
        language?: ProjectLanguage
    }) {
        const { destination, schema, shouldIncludeFileExtension, language } =
            options

        if (!schema.namespace) {
            throw new SchemaError({
                code: 'MISSING_PARAMETERS',
                parameters: ['namespace'],
                friendlyMessage: `Schema with id "${schema.id}" is missing a namespace so it can not be written to disk.`,
            })
        }

        const name =
            language == 'go'
                ? `${namesUtil.toSnake(schema.id)}.go`
                : `${schema.id}.schema${shouldIncludeFileExtension === false ? '' : '.ts'}`

        return pathUtil.join(
            destination,
            namesUtil.toCamel(schema.namespace),
            schema.version ?? '',
            name
        )
    },

    resolveTypeFilePaths(options: {
        cwd: string
        generateStandaloneTypesFile: boolean
        schemaTypesDestinationDirOrFile: string
        fieldTypesDestinationDir: string
        language: ProjectLanguage
    }) {
        let {
            cwd,
            generateStandaloneTypesFile,
            schemaTypesDestinationDirOrFile,
            fieldTypesDestinationDir,
            language,
        } = options

        if (
            language === 'go' &&
            !generateStandaloneTypesFile &&
            schemaTypesDestinationDirOrFile === '#spruce/schemas'
        ) {
            schemaTypesDestinationDirOrFile = 'schemas/schemas.go'
        }

        const resolvedSchemaTypesDestination = diskUtil.resolvePath(
            cwd,
            generateStandaloneTypesFile &&
                diskUtil.isDirPath(schemaTypesDestinationDirOrFile)
                ? this.resolveStandaloneSchemaTypesFilePath({
                      cwd,
                      schemaTypesDestinationDirOrFile,
                  })
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

    resolveStandaloneSchemaTypesFilePath(options: {
        cwd: string
        schemaTypesDestinationDirOrFile: string
    }) {
        const { cwd, schemaTypesDestinationDirOrFile } = options

        return diskUtil.resolvePath(
            cwd,
            schemaTypesDestinationDirOrFile,
            diskUtil.detectProjectLanguage(cwd) === 'go'
                ? '../../schemas/core_schemas.go'
                : 'core.schemas.types.ts'
        )
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
