import { Schema, SchemaTypesRenderer } from '@sprucelabs/schema'
import handlebars from 'handlebars'

handlebars.registerHelper('schemaRenderer', function (schema: Schema) {
    const renderer = SchemaTypesRenderer.Renderer()
    const rendered = renderer.render(schema, {
        language: 'go',
    })

    return rendered
})
