import { SchemaTemplateItem } from '@sprucelabs/schema'
import handlebars from 'handlebars'

handlebars.registerHelper('schemaNamespacePath', function (options: any) {
    const { schemaTemplateItem } = options.hash as {
        schemaTemplateItem: SchemaTemplateItem
    }

    if (!schemaTemplateItem) {
        throw new Error(`schemaNamespacePath needs schemaTemplateItem=item`)
    }

    const { globalSchemaNamespace } = options?.data?.root ?? {}

    if (!globalSchemaNamespace) {
        throw new Error(
            'schemaNamespacePath template addon needs globalSchemaNamespace in the root context.'
        )
    }

    let path = `${globalSchemaNamespace}.${schemaTemplateItem.namespace}`

    if (schemaTemplateItem.schema.version) {
        path += `.${schemaTemplateItem.schema.version}`
    }

    path += `.${schemaTemplateItem.namePascal}`

    return path
})
