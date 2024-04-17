import { Schema, SchemaField, SchemaTemplateItem } from '@sprucelabs/schema'
import handlebars from 'handlebars'
import { camelCase, uniq } from 'lodash'

handlebars.registerHelper(
    'importRelatedSchemas',
    function (schema: Schema, options) {
        if (!schema) {
            throw new Error(
                'importRelatedSchemas needs a Schema as the first arg'
            )
        }

        const {
            data: { root },
        } = options

        const schemaTemplateItems: SchemaTemplateItem[] | undefined =
            root?.schemaTemplateItems

        if (!schemaTemplateItems) {
            throw new Error(
                'importRelatedSchemas needs schemaTemplateItems passed to parent template'
            )
        }

        const fields = schema.dynamicFieldSignature
            ? [schema.dynamicFieldSignature]
            : Object.values(schema.fields ?? {})
        const imports: string[] = []

        fields.forEach((field) => {
            if (field.type === 'schema') {
                const related =
                    SchemaField.mapFieldDefinitionToSchemaIdsWithVersion(field)
                related.forEach((idWithVersion) => {
                    const matched = schemaTemplateItems.find(
                        (t) =>
                            t.id === idWithVersion.id &&
                            t.schema.version === idWithVersion.version &&
                            t.schema.namespace === idWithVersion.namespace
                    )
                    if (matched) {
                        imports.push(
                            `import ${matched.nameCamel}Schema${
                                matched.schema.version
                                    ? `_${matched.schema.version}`
                                    : ''
                            } from '${matched.destinationDir}/${camelCase(
                                matched.namespace
                            )}${matched.schema.version ? `/${matched.schema.version}` : ''}/${
                                matched.id
                            }.schema'`
                        )
                    }
                })
            }
        })

        return uniq(imports).join('\n')
    }
)
