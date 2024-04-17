import pathUtil from 'path'
import { SchemaTemplateItem, FieldTemplateItem } from '@sprucelabs/schema'
import { CORE_NAMESPACE, diskUtil } from '@sprucelabs/spruce-skill-utils'
import { ValueTypes } from '@sprucelabs/spruce-templates'
import uniq from 'lodash/uniq'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import syncSchemasActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncSchemasOptions.schema'
import SpruceError from '../../../errors/SpruceError'
import SchemaTemplateItemBuilder from '../../../templateItemBuilders/SchemaTemplateItemBuilder'
import { GeneratedFile } from '../../../types/cli.types'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import schemaDiskUtil from '../utilities/schemaDisk.utility'
import ValueTypeBuilder from '../ValueTypeBuilder'

type OptionsSchema =
    SpruceSchemas.SpruceCli.v2020_07_22.SyncSchemasOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.SyncSchemasOptions
export default class SyncAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = syncSchemasActionSchema
    public commandAliases = ['sync.schemas']
    public invocationMessage = 'Building schemas and generating types... 📃'

    private readonly schemaWriter = this.Writer('schema')
    private readonly schemaStore = this.Store('schema')

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const normalizedOptions = this.validateAndNormalizeOptions(options)
        const isInCoreSchemasModule =
            this.Service('pkg').get('name') ===
            '@sprucelabs/spruce-core-schemas'

        let {
            schemaTypesDestinationDirOrFile,
            fieldTypesDestinationDir,
            schemaLookupDir,
            addonsLookupDir,
            shouldEnableVersioning,
            globalSchemaNamespace,
            shouldFetchRemoteSchemas,
            shouldGenerateCoreSchemaTypes = isInCoreSchemasModule,
            shouldFetchLocalSchemas,
            generateFieldTypes,
            generateStandaloneTypesFile,
            deleteDestinationDirIfNoSchemas,
            shouldFetchCoreSchemas,
            registerBuiltSchemas,
            syncingMessage,
            deleteOrphanedSchemas,
            moduleToImportFromWhenRemote,
            shouldInstallMissingDependencies,
        } = normalizedOptions

        this.ui.startLoading('Loading details about your skill... 🧐')

        let localNamespace =
            await this.Store('skill').loadCurrentSkillsNamespace()
        let shouldImportCoreSchemas = true

        if (shouldGenerateCoreSchemaTypes) {
            shouldFetchRemoteSchemas = false
            shouldFetchLocalSchemas = true
            shouldFetchCoreSchemas = false
            registerBuiltSchemas = true
            generateStandaloneTypesFile = true
            shouldImportCoreSchemas = false
            localNamespace = CORE_NAMESPACE
        }

        let coreSyncResults: FeatureActionResponse | undefined

        const {
            resolvedFieldTypesDestination,
            resolvedSchemaTypesDestinationDirOrFile,
            resolvedSchemaTypesDestination,
        } = schemaDiskUtil.resolveTypeFilePaths({
            cwd: this.cwd,
            generateStandaloneTypesFile,
            schemaTypesDestinationDirOrFile,
            fieldTypesDestinationDir,
        })

        this.ui.startLoading('Generating field types...')

        const { fieldTemplateItems, fieldErrors, generateFieldFiles } =
            await this.generateFieldTemplateItems({
                addonsLookupDir,
                shouldGenerateFieldTypes: generateFieldTypes,
                resolvedFieldTypesDestination,
            })

        this.ui.startLoading(syncingMessage)

        const schemaErrors: SpruceError[] = []
        let schemaTemplateItems: SchemaTemplateItem[] | undefined
        let typeResults: GeneratedFile[] = []

        try {
            const templateResults = await this.generateSchemaTemplateItems({
                schemaLookupDir,
                shouldFetchLocalSchemas,
                moduleToImportFromWhenRemote,
                resolvedSchemaTypesDestinationDirOrFile,
                shouldEnableVersioning,
                shouldFetchRemoteSchemas,
                shouldFetchCoreSchemas,
                localNamespace,
            })

            schemaErrors.push(...templateResults.schemaErrors)
            schemaTemplateItems = templateResults.schemaTemplateItems
        } catch (err: any) {
            schemaErrors.push(err)
        }

        if (schemaErrors.length === 0 && schemaTemplateItems) {
            if (
                deleteDestinationDirIfNoSchemas &&
                schemaTemplateItems.length === 0
            ) {
                diskUtil.deleteDir(resolvedSchemaTypesDestinationDirOrFile)
                return {}
            }

            if (deleteOrphanedSchemas) {
                this.ui.startLoading('Identifying orphaned schemas...')

                await schemaDiskUtil.deleteOrphanedSchemas(
                    resolvedSchemaTypesDestinationDirOrFile,
                    schemaTemplateItems
                )
            }

            await this.optionallyInstallRemoteModules(
                schemaTemplateItems,
                shouldInstallMissingDependencies
            )

            let valueTypes: ValueTypes | undefined

            try {
                valueTypes = await this.generateValueTypes({
                    resolvedDestination: resolvedFieldTypesDestination,
                    fieldTemplateItems,
                    schemaTemplateItems,
                    globalSchemaNamespace: globalSchemaNamespace ?? undefined,
                })
            } catch (err: any) {
                schemaErrors.push(err)
            }

            if (valueTypes) {
                try {
                    this.ui.startLoading('Determining what changed... ⚡️')

                    typeResults = await this.schemaWriter.writeSchemasAndTypes(
                        resolvedSchemaTypesDestination,
                        {
                            registerBuiltSchemas,
                            fieldTemplateItems,
                            schemaTemplateItems,
                            shouldImportCoreSchemas,
                            valueTypes,
                            globalSchemaNamespace:
                                globalSchemaNamespace ?? undefined,
                            typesTemplate: generateStandaloneTypesFile
                                ? 'schema/core.schemas.types.ts.hbs'
                                : undefined,
                        }
                    )
                } catch (err: any) {
                    schemaErrors.push(err)
                }
            }
        }

        const p = resolvedSchemaTypesDestination
        diskUtil.deleteEmptyDirs(diskUtil.isDir(p) ? p : pathUtil.dirname(p))

        this.ui.stopLoading()

        const errors = [...schemaErrors, ...fieldErrors]

        return actionUtil.mergeActionResults(coreSyncResults || {}, {
            files: [...typeResults, ...generateFieldFiles],
            errors: errors.length > 0 ? errors : undefined,
            meta: {
                schemaTemplateItems,
                fieldTemplateItems,
            },
        })
    }

    private async optionallyInstallRemoteModules(
        schemaTemplateItems: SchemaTemplateItem[],
        forceInstall?: boolean
    ) {
        const modules = uniq(
            schemaTemplateItems
                .map((item) => item.importFrom)
                .filter((i) => !!i)
        ) as string[]

        const notInstalled: string[] = []

        const pkg = this.Service('pkg')

        for (const m of modules) {
            if (!pkg.isInstalled(m) && notInstalled.indexOf(m) === -1) {
                notInstalled.push(m)
            }
        }

        if (notInstalled.length > 0) {
            if (!forceInstall) {
                this.ui.stopLoading()

                this.ui.renderSection({
                    headline: `Missing ${notInstalled.length} module${
                        notInstalled.length === 1 ? '' : 's'
                    }`,
                    lines: [
                        `Looks like I need to install the following modules to continue to sync schemas:`,
                        '',
                        ...notInstalled,
                    ],
                })

                const confirm = await this.ui.confirm('Should we do that now?')

                if (!confirm) {
                    throw new SpruceError({
                        code: 'ACTION_CANCELLED',
                        friendlyMessage: `I can't sync schemas because of the missing modules.`,
                    })
                }
            }

            this.ui.startLoading(
                `Installing ${notInstalled.length} missing module${
                    notInstalled.length === 1 ? '' : 's...'
                }`
            )

            const pkg = this.Service('pkg')
            await pkg.install(notInstalled)

            this.ui.stopLoading()
        }
    }

    private async generateSchemaTemplateItems(options: {
        schemaLookupDir: string | undefined
        localNamespace: string
        resolvedSchemaTypesDestinationDirOrFile: string
        shouldFetchLocalSchemas: boolean
        moduleToImportFromWhenRemote?: string
        shouldEnableVersioning: boolean
        shouldFetchRemoteSchemas: boolean
        shouldFetchCoreSchemas: boolean
    }) {
        const {
            schemaLookupDir,
            resolvedSchemaTypesDestinationDirOrFile,
            shouldEnableVersioning,
            shouldFetchRemoteSchemas,
            shouldFetchCoreSchemas,
            shouldFetchLocalSchemas,
            localNamespace,
            moduleToImportFromWhenRemote,
        } = options

        this.ui.startLoading('Loading builders...')

        const { schemasByNamespace, errors: schemaErrors } =
            await this.schemaStore.fetchSchemas({
                localSchemaLookupDir: schemaLookupDir,
                shouldFetchLocalSchemas,
                shouldFetchRemoteSchemas,
                shouldEnableVersioning,
                moduleToImportFromWhenRemote,
                localNamespace,
                shouldFetchCoreSchemas,
                didUpdateHandler: (message) => {
                    this.ui.startLoading(message)
                },
            })

        const hashSpruceDestination =
            resolvedSchemaTypesDestinationDirOrFile.replace(
                diskUtil.resolveHashSprucePath(this.cwd),
                '#spruce'
            )

        let total = 0
        let totalNamespaces = 0
        for (const namespace of Object.keys(schemasByNamespace)) {
            totalNamespaces++
            total += schemasByNamespace[namespace].length
        }

        this.ui.startLoading(
            `Building ${total} schemas from ${totalNamespaces} namespaces.`
        )

        const schemaTemplateItemBuilder = new SchemaTemplateItemBuilder(
            localNamespace
        )

        const schemaTemplateItems: SchemaTemplateItem[] =
            schemaTemplateItemBuilder.buildTemplateItems(
                schemasByNamespace,
                hashSpruceDestination
            )

        return { schemaTemplateItems, schemaErrors }
    }

    private async generateFieldTemplateItems(options: {
        addonsLookupDir: string
        shouldGenerateFieldTypes: boolean
        resolvedFieldTypesDestination: string
    }) {
        const {
            addonsLookupDir,
            shouldGenerateFieldTypes: generateFieldTypes,
            resolvedFieldTypesDestination,
        } = options

        const action = this.Action('schema', 'syncFields')
        const results = await action.execute({
            fieldTypesDestinationDir: resolvedFieldTypesDestination,
            addonsLookupDir,
            generateFieldTypes,
        })

        return {
            generateFieldFiles: results.files ?? [],
            fieldTemplateItems: results.meta?.fieldTemplateItems ?? [],
            fieldErrors: results.errors ?? [],
        }
    }

    private async generateValueTypes(options: {
        resolvedDestination: string
        fieldTemplateItems: FieldTemplateItem[]
        schemaTemplateItems: SchemaTemplateItem[]
        globalSchemaNamespace?: string
    }) {
        this.ui.startLoading('Generating value types...')

        const builder = new ValueTypeBuilder(
            this.schemaWriter,
            this.Service('import')
        )

        return builder.generateValueTypes(options)
    }
}
