import pathUtil from 'path'
import globby from '@sprucelabs/globby'
import {
    Schema,
    FieldRegistration,
    fieldRegistrations,
    normalizeSchemaToIdWithVersion,
    SchemaError,
} from '@sprucelabs/schema'
import {
    personSchema,
    skillSchema,
    skillCreatorSchema,
    locationSchema,
    organizationSchema,
    personOrganizationSchema,
    personLocationSchema,
    roleSchema,
    messageSchema,
    messageSourceSchema,
    messageTargetSchema,
    sendMessageSchema,
    choiceSchema,
    linkSchema,
} from '@sprucelabs/spruce-core-schemas'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { CORE_NAMESPACE } from '@sprucelabs/spruce-skill-utils'
import { isEqual, uniqBy } from 'lodash'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore from '../../../stores/AbstractStore'
import { InternalUpdateHandler } from '../../../types/cli.types'

export const coreSchemas = {
    personSchema,
    skillSchema,
    skillCreatorSchema,
    locationSchema,
    organizationSchema,
    personOrganizationSchema,
    personLocationSchema,
    roleSchema,
    messageSchema,
    messageSourceSchema,
    messageTargetSchema,
    sendMessageSchema,
    choiceSchema,
    linkSchema,
}

interface AddonItem {
    path: string
    registration: FieldRegistration
    isLocal: boolean
}

export type SchemasByNamespace = Record<string, Schema[]>

interface FetchSchemasResults {
    schemasByNamespace: SchemasByNamespace
    errors: SpruceError[]
}
export interface FetchedField {
    path?: string
    registration: FieldRegistration
    isLocal: boolean
}

interface FetchFieldsResults {
    errors: SpruceError[]
    fields: FetchedField[]
}

const DEFAULT_LOCAL_SCHEMA_DIR = 'src/schemas'

export default class SchemaStore extends AbstractStore {
    public readonly name = 'schema'

    public async fetchSchemas(options: {
        localSchemaLookupDir?: string
        shouldFetchRemoteSchemas?: boolean
        shouldEnableVersioning?: boolean
        localNamespace: string
        shouldFetchCoreSchemas?: boolean
        moduleToImportFromWhenRemote?: string
        shouldFetchLocalSchemas?: boolean
        didUpdateHandler?: InternalUpdateHandler
    }): Promise<FetchSchemasResults> {
        const {
            localSchemaLookupDir: localSchemaDir = DEFAULT_LOCAL_SCHEMA_DIR,
            shouldFetchLocalSchemas = true,
            shouldFetchRemoteSchemas = true,
            shouldEnableVersioning = true,
            localNamespace,
            shouldFetchCoreSchemas = true,
            didUpdateHandler,
            moduleToImportFromWhenRemote,
        } = options || {}

        const results: FetchSchemasResults = {
            errors: [],
            schemasByNamespace: {},
        }

        if (shouldFetchCoreSchemas) {
            results.schemasByNamespace[CORE_NAMESPACE] = Object.values(
                coreSchemas
            ).map((schema) => ({
                ...schema,
                namespace: CORE_NAMESPACE,
            }))
        }

        if (shouldFetchLocalSchemas) {
            const locals = await this.loadLocalSchemas(
                localSchemaDir,
                localNamespace,
                shouldEnableVersioning,
                didUpdateHandler
            )

            if (moduleToImportFromWhenRemote) {
                locals.schemas.forEach((local) => {
                    local.moduleToImportFromWhenRemote =
                        moduleToImportFromWhenRemote
                })
            }

            results.schemasByNamespace[localNamespace] = locals.schemas
            results.errors.push(...locals.errors)
        }

        if (shouldFetchRemoteSchemas) {
            await this.emitDidFetchSchemasAndMixinResults(
                localNamespace,
                results
            )
        }

        return results
    }

    private async emitDidFetchSchemasAndMixinResults(
        localNamespace: string,
        results: FetchSchemasResults
    ) {
        const schemas: Schema[] = []
        for (const namespace in results.schemasByNamespace) {
            schemas.push(...results.schemasByNamespace[namespace])
        }

        const remoteResults = await this.emitter.emit(
            'schema.did-fetch-schemas',
            {
                schemas,
            }
        )

        const { payloads, errors } =
            eventResponseUtil.getAllResponsePayloadsAndErrors(
                remoteResults,
                SpruceError
            )

        if (errors && errors.length > 0) {
            results.errors.push(...errors)
        } else {
            payloads.forEach((payload) => {
                payload?.schemas?.forEach((schema: Schema) => {
                    this.mixinSchemaOrThrowIfExists(
                        schema,
                        localNamespace,
                        results
                    )
                })
            })
        }
    }

    private mixinSchemaOrThrowIfExists(
        schema: Schema,
        localNamespace: string,
        results: FetchSchemasResults
    ) {
        const namespace = schema.namespace ?? localNamespace

        if (!results.schemasByNamespace[namespace]) {
            results.schemasByNamespace[namespace] = []
        }

        const idWithVersion = normalizeSchemaToIdWithVersion(schema)
        const match = results.schemasByNamespace[namespace].find((s) =>
            isEqual(normalizeSchemaToIdWithVersion(s), idWithVersion)
        )

        if (!match) {
            results.schemasByNamespace[namespace].push(schema)
        }
    }

    public async hasLocalSchemas() {
        const matches = await this.globbyLocalBuilders(DEFAULT_LOCAL_SCHEMA_DIR)
        return matches.length > 0
    }

    private async loadLocalSchemas(
        localLookupDir: string,
        localNamespace: string,
        shouldEnableVersioning?: boolean,
        didUpdateHandler?: InternalUpdateHandler
    ) {
        const localMatches = await this.globbyLocalBuilders(localLookupDir)

        const errors: SpruceError[] = []
        const schemas: Schema[] = []

        didUpdateHandler?.(
            `Starting import of ${localMatches.length} schema builders...`
        )

        try {
            const importer = this.Service('import')
            const imported = await importer.bulkImport(localMatches)

            for (let c = 0; c < localMatches.length; c++) {
                try {
                    const local = localMatches[c]
                    let schema = imported[c]

                    let version: undefined | string = this.resolveLocalVersion(
                        shouldEnableVersioning,
                        local,
                        errors
                    )
                    if (version || shouldEnableVersioning === false) {
                        schema = this.prepareLocalSchema(
                            schema,
                            localNamespace,
                            version,
                            didUpdateHandler
                        )
                        schemas.push(schema)
                    }
                } catch (err: any) {
                    errors.push(
                        new SpruceError({
                            code: 'SCHEMA_FAILED_TO_IMPORT',
                            file: err?.options?.file ?? '**UNKNOWN**',
                            originalError: err?.originalError ?? err,
                        })
                    )
                }
            }
        } catch (err: any) {
            throw new SpruceError({
                code: 'SCHEMA_FAILED_TO_IMPORT',
                file: err?.options?.file ?? '**UNKNOWN**',
                originalError: err?.originalError ?? err,
            })
        }

        return {
            schemas,
            errors,
        }
    }

    private async globbyLocalBuilders(localLookupDir: string) {
        return await globby(
            diskUtil.resolvePath(
                this.cwd,
                localLookupDir,
                '**/*.builder.[t|j]s'
            )
        )
    }

    private resolveLocalVersion(
        shouldEnableVersioning: boolean | undefined,
        local: string,
        errors: SpruceError[]
    ) {
        let version: undefined | string

        try {
            version =
                shouldEnableVersioning === false
                    ? undefined
                    : versionUtil.extractVersion(this.cwd, local).constValue
        } catch (err) {
            errors.push(
                new SpruceError({
                    // @ts-ignore
                    code: 'VERSION_MISSING',
                    friendlyMessage: `It looks like your schema's are not versioned. Make sure schemas are in a directory like src/schemas/${
                        versionUtil.generateVersion().dirValue
                    }/*.ts`,
                })
            )
        }
        return version
    }

    private prepareLocalSchema(
        schema: Schema,
        localNamespace: string,
        version: string | undefined,
        didUpdateHandler: InternalUpdateHandler | undefined
    ) {
        let errors: string[] = []

        if (schema.version) {
            errors.push('version_should_not_be_set')
        }

        if (schema.namespace) {
            errors.push('namespace_should_not_be_set')
        }

        schema.namespace = localNamespace

        if (errors.length > 0) {
            throw new SchemaError({
                code: 'INVALID_SCHEMA',
                schemaId: schema.id,
                errors,
                friendlyMessage:
                    'You should not set a namespace nor version in your schema builder.',
            })
        }

        schema.version = version

        didUpdateHandler?.(`Imported ${schema.id} builder.`)

        return schema
    }

    public async fetchFields(options?: {
        localAddonsDir?: string
    }): Promise<FetchFieldsResults> {
        const { localAddonsDir } = options || {}

        const coreAddons = fieldRegistrations.map((registration) => {
            return {
                registration,
                isLocal: false,
            }
        })

        const localErrors: SpruceError[] = []

        const localAddons = !localAddonsDir
            ? []
            : await Promise.all(
                  (
                      await globby([
                          pathUtil.join(localAddonsDir, '/*Field.addon.[t|j]s'),
                      ])
                  ).map(async (file: string) => {
                      try {
                          const importService = this.Service('import')
                          const registration =
                              await importService.importDefault<FieldRegistration>(
                                  file
                              )

                          return {
                              path: file,
                              registration,
                              isLocal: true,
                          }
                      } catch (err: any) {
                          localErrors.push(
                              new SpruceError({
                                  code: 'FAILED_TO_IMPORT',
                                  file,
                                  originalError: err,
                              })
                          )
                          return false
                      }
                  })
              )

        const allFields = uniqBy(
            [
                ...coreAddons,
                ...(localAddons.filter((addon) => !!addon) as AddonItem[]),
            ],
            'registration.type'
        )

        return {
            fields: allFields,
            errors: localErrors,
        }
    }
}
