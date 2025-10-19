import {
    Schema,
    SchemaTemplateItem,
    SchemaTypesRenderer,
} from '@sprucelabs/schema'
import handlebars from 'handlebars'

handlebars.registerHelper(
    'schemaRenderer',
    function (schema: Schema, schemaTemplateItems: SchemaTemplateItem[]) {
        const renderer = SchemaTypesRenderer.Renderer()
        const rendered = renderer.render(schema, {
            language: 'go',
            schemaTemplateItems,
        })

        return rendered
    }
)
