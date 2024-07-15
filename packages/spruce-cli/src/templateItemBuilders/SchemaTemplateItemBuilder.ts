import {
    Schema,
    SchemaTemplateItem,
    SchemaField,
    SchemaIdWithVersion,
    normalizeSchemaToIdWithVersion,
    isIdWithVersion,
} from '@sprucelabs/schema'
import { CORE_NAMESPACE } from '@sprucelabs/spruce-skill-utils'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import merge from 'lodash/merge'
import SpruceError from '../errors/SpruceError'
import { SchemasByNamespace } from '../features/schema/stores/SchemaStore'
import schemaUtil from '../features/schema/utilities/schema.utility'

interface SchemaWithDependencies {
    schema: Schema
    dependencies: SchemaIdWithVersion[]
    isNested: boolean
}

export default class SchemaTemplateItemBuilder {
    private schemasByKey: Record<string, SchemaWithDependencies> = {}
    private localNamespace: string

    public constructor(localNamespace: string) {
        this.localNamespace = localNamespace
    }

    public buildTemplateItems(
        schemasByNamespace: SchemasByNamespace,
        destinationDir = '#spruce/schemas'
    ) {
        const schemas: Schema[] = []
        const namespaces = Object.keys(schemasByNamespace)

        for (const namespace of namespaces) {
            schemas.push(
                ...schemasByNamespace[namespace].map((s) => ({
                    namespace,
                    ...s,
                }))
            )
        }

        this.flattenSchemas(schemas)

        const flattened = Object.values(this.schemasByKey)
        const sorted = flattened
            .sort((a, b) => {
                if (this.doesADependOnB(a, b)) {
                    return -1
                } else if (this.doesADependOnB(b, a)) {
                    return 1
                }
                return 0
            })
            .reverse()

        const schemaTemplateItems = sorted.map((s) =>
            this.buildTemplateItem({
                ...s,
                destinationDir,
            })
        )

        return schemaTemplateItems
    }

    private doesADependOnB(
        a: SchemaWithDependencies,
        b: SchemaWithDependencies
    ) {
        const { dependencies } = a
        const idWithVersion = normalizeSchemaToIdWithVersion(b.schema)

        if (dependencies.find((dep) => isEqual(dep, idWithVersion))) {
            return true
        }

        return false
    }

    private flattenSchemas(schemas: Schema[]) {
        schemas.forEach((def) => {
            this.flattenSchema(def)
        })
    }

    private flattenSchema(schema: Schema, isNested = false) {
        const localSchema = cloneDeep(schema)

        const namedFields = this.pluckFields(localSchema)
        const dependencies: SchemaIdWithVersion[] = []

        namedFields.forEach(({ field, name }) => {
            if (field.type === 'schema') {
                const schemasOrIdsWithVersion =
                    SchemaField.mapFieldDefinitionToSchemasOrIdsWithVersion(
                        field
                    )

                const { ...originalOptions } = field.options
                delete field.options.schema
                delete field.options.schemaId
                delete field.options.schemaIds
                delete field.options.schemas
                field.options.schemaIds = []

                schemasOrIdsWithVersion.forEach((schemaOrId) => {
                    const related = { ...schemaOrId }

                    if (localSchema.version && !related.version) {
                        related.version = localSchema.version
                    }

                    if (!related.namespace) {
                        related.namespace = schema.namespace
                    }

                    if (
                        localSchema.moduleToImportFromWhenRemote &&
                        //@ts-ignore
                        !related.moduleToImportFromWhenRemote &&
                        !isIdWithVersion(related)
                    ) {
                        //@ts-ignore
                        related.moduleToImportFromWhenRemote =
                            localSchema.moduleToImportFromWhenRemote
                    }

                    const relatedIdWithVersion =
                        normalizeSchemaToIdWithVersion(related)

                    field.options.schemaIds?.push(relatedIdWithVersion)
                    dependencies.push(relatedIdWithVersion)

                    this.flattenSchema(related, true)
                })

                if (field.options.schemaIds.length === 0) {
                    throw new SpruceError({
                        code: 'SCHEMA_TEMPLATE_ITEM_BUILDING_FAILED',
                        schemaId: schema.id,
                        schemaNamespace: schema.namespace as string,
                        fieldName: name,
                        fieldOptions: originalOptions,
                    })
                }
            }
        })

        const key = schemaUtil.generateCacheKey(localSchema)
        this.schemasByKey[key] = merge(this.schemasByKey[key] ?? {}, {
            schema: localSchema,
            dependencies,
            isNested:
                this.schemasByKey[key]?.isNested === false ? false : isNested,
        })
    }

    private pluckFields(localSchema: Schema) {
        const fields = localSchema.dynamicFieldSignature
            ? { dynamicField: localSchema.dynamicFieldSignature }
            : (localSchema.fields ?? {})

        const namedFields = Object.keys(fields).map((name) => ({
            name,
            field: fields[name],
        }))
        return namedFields
    }

    private buildTemplateItem(options: {
        schema: Schema
        isNested: boolean
        destinationDir: string
    }): SchemaTemplateItem {
        const { schema, isNested, destinationDir } = options
        const namespace = schema.namespace ?? this.localNamespace

        const importFrom = this.getImportFromForSchema(schema)
        const item: SchemaTemplateItem = {
            id: schema.id,
            namespace,
            schema,
            ...schemaUtil.generateNamesForSchema(schema),
            isNested,
            destinationDir,
        }

        if (importFrom) {
            item.importFrom = importFrom
        }

        if (
            namespace.toLowerCase() === this.localNamespace.toLowerCase() &&
            schema.importsWhenLocal
        ) {
            item.imports = [...schema.importsWhenLocal]
        } else if (
            namespace.toLowerCase() !== this.localNamespace.toLowerCase() &&
            schema.importsWhenRemote
        ) {
            item.imports = [...schema.importsWhenRemote]
        }

        const namedFields = this.pluckFields(schema)

        for (const { field } of namedFields) {
            if (field.type === 'schema') {
                field.options.schemaIds?.forEach((idWithVersion) => {
                    const key = schemaUtil.generateCacheKey(idWithVersion)
                    const match = this.schemasByKey[key]

                    if (
                        match.schema.importsWhenRemote &&
                        match.schema.namespace &&
                        match.schema.namespace.toLowerCase() !==
                            this.localNamespace.toLowerCase()
                    ) {
                        if (!item.imports) {
                            item.imports = []
                        }

                        item.imports.push(...match.schema.importsWhenRemote)
                    }
                })
            }
        }

        return item
    }

    private getImportFromForSchema(schema: Schema): string | undefined {
        if (
            schema.moduleToImportFromWhenRemote &&
            schema.namespace !== this.localNamespace
        ) {
            return schema.moduleToImportFromWhenRemote
        }
        switch (schema.namespace) {
            case CORE_NAMESPACE:
                if (this.localNamespace !== CORE_NAMESPACE) {
                    return '@sprucelabs/spruce-core-schemas'
                }
                break
        }

        return undefined
    }
}
