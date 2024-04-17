import { TemplateRenderAs } from '@sprucelabs/schema'
import { SCHEMA_VERSION_FALLBACK } from '@sprucelabs/spruce-skill-utils'
import handlebars from 'handlebars'
import { ValueTypes } from '../types/templates.types'

/* The type for the value of a field. the special case is if the field is of type schema, then we get the target's interface */
handlebars.registerHelper(
    'valueTypeLiteral',
    function (
        namespace: string,
        nameCamel: string,
        version: string | undefined,
        fieldName: string,
        renderAs: TemplateRenderAs,
        options
    ) {
        if (!namespace) {
            throw new Error('valueTypeLiteral needs namespace as 1st argument')
        }

        if (!nameCamel) {
            throw new Error('valueTypeLiteral needs nameCamel as 2st argument')
        }

        if (!fieldName) {
            throw new Error('valueTypeLiteral needs fieldName as 3st argument')
        }

        if (
            renderAs !== TemplateRenderAs.Value &&
            renderAs !== TemplateRenderAs.Type &&
            renderAs !== TemplateRenderAs.SchemaType
        ) {
            throw new Error(
                'valueTypeLiteral helper needs renderAs to be "TemplateRenderAs.Type" or "TemplateRenderAs.Value" or "TemplateRenderAs.schemaType"'
            )
        }

        const {
            data: { root },
        } = options

        const valueTypes: ValueTypes = root?.valueTypes
        if (!valueTypes) {
            throw new Error(
                'valueTypeLiteral helper needs a valuesTypes in the root context'
            )
        }

        const v = version ? version : SCHEMA_VERSION_FALLBACK

        const valueType =
            valueTypes[namespace]?.[nameCamel]?.[v]?.[fieldName]?.valueTypes[
                renderAs
            ]

        if (!valueType) {
            throw new Error(
                `Unable to render value type for field "${namespace}.${nameCamel}.${v}.${fieldName}"`
            )
        }

        return valueType
    }
)
