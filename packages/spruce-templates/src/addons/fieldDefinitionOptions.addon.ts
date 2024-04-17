import { SchemaTemplateItem, TemplateRenderAs } from '@sprucelabs/schema'
import handlebars from 'handlebars'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'

/** Renders field options */
handlebars.registerHelper(
    'fieldDefinitionOptions',
    function (
        namespace: string,
        schemaNameCamel: string,
        version: string,
        fieldName: string,
        fieldDefinition: FieldDefinitions,
        renderAs: TemplateRenderAs,
        options
    ) {
        if (typeof namespace !== 'string') {
            throw new Error(
                'fieldDefinitionOptions helper needs namespace first'
            )
        }

        if (typeof schemaNameCamel !== 'string') {
            throw new Error(
                'fieldDefinitionOptions helper needs schemaNameCamel 2nd.'
            )
        }

        if (typeof fieldName !== 'string') {
            throw new Error('fieldDefinitionOptions helper needs fieldName 3rd')
        }

        if (!fieldDefinition) {
            throw new Error(
                'fieldDefinitionOptions helper needs a FieldDefinition as the 4th argument'
            )
        }

        if (
            !options ||
            (renderAs !== TemplateRenderAs.Type &&
                renderAs !== TemplateRenderAs.Value)
        ) {
            throw new Error(
                "fieldDefinitionOptions helper's second arg as type|value"
            )
        }

        const {
            data: { root },
        } = options

        const schemaTemplateItems: SchemaTemplateItem[] | undefined =
            root && root.schemaTemplateItems

        if (!schemaTemplateItems) {
            throw new Error(
                'fieldDefinitionOptions needs schemaTemplateItems passed to parent template'
            )
        }

        const updatedOptions: Record<string, any> | undefined =
            fieldDefinition.options && {
                ...fieldDefinition.options,
            }
        // If this is a schema type, we need to map it to it's proper value type
        if (fieldDefinition.type === 'schema' && updatedOptions) {
            const value = handlebars.helpers.valueTypeLiteral(
                namespace,
                schemaNameCamel,
                version,
                fieldName,
                renderAs === TemplateRenderAs.Type
                    ? TemplateRenderAs.SchemaType
                    : TemplateRenderAs.Value,
                options
            )

            // Swap out id for reference
            delete updatedOptions.schemaId
            delete updatedOptions.schema
            delete updatedOptions.schemaIds
            delete updatedOptions.schemas

            if (value.substr(-1) === ']') {
                updatedOptions.schemas = value
            } else {
                updatedOptions.schema = value
            }
        }

        // No options, undefined is acceptable
        if (Object.keys(updatedOptions ?? {}).length === 0) {
            return 'undefined'
        }

        let template = `{`
        Object.keys(updatedOptions ?? {}).forEach((key) => {
            // @ts-ignore TODO how to type this
            const value = updatedOptions[key]
            template += `${key}: `
            if (key === 'schemas' || key === 'schema') {
                template += `${value},`
            } else if (typeof value !== 'string') {
                template += `${JSON.stringify(value)},`
            } else {
                template += `\`${value.replace(/([`])/g, '\\$1')}\`,`
            }
        })

        template += '}'

        return template
    }
)
