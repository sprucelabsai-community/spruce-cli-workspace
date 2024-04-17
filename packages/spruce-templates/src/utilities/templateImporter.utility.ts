import fsUtil from 'fs'
import pathUtil from 'path'
import handlebars from 'handlebars'

const templateCache: Record<string, HandlebarsTemplateDelegate<any>> = {}
const templatePath = pathUtil.join(__dirname, '..', 'templates', 'typescript')

const templateImportUtil = {
    getTemplate(filename: string) {
        if (!templateCache[filename]) {
            const contents = fsUtil
                .readFileSync(pathUtil.join(templatePath, filename))
                .toString()
            const template = handlebars.compile(contents)
            templateCache[filename] = template
        }

        return templateCache[filename]
    },
}

export default templateImportUtil
