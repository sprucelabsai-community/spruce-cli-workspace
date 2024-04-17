import path from 'path'
import fs from 'fs-extra'
import handlebars from 'handlebars'

const templatePath = path.join(__dirname, '..', 'templates', 'typescript')

const schemaBodyPartial: string = fs
    .readFileSync(path.join(templatePath, 'schema/partials/schemaBody.ts.hbs'))
    .toString()

handlebars.registerPartial('schemaBody', schemaBodyPartial)
