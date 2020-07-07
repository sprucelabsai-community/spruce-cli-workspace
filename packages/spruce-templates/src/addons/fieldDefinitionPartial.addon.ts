import path from 'path'
import fs from 'fs-extra'
import handlebars from 'handlebars'

const templatePath = path.join(__dirname, '..', 'templates', 'typescript')

const fieldPartial: string = fs
	.readFileSync(
		path.join(templatePath, 'schemas/partials/fieldDefinition.ts.hbs')
	)
	.toString()

handlebars.registerPartial('fieldDefinition', fieldPartial)
