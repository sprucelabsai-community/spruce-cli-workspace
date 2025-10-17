import fsUtil from 'fs'
import pathUtil from 'path'
import handlebars from 'handlebars'

const templateCache: Record<string, HandlebarsTemplateDelegate<any>> = {}
const templatePath = pathUtil.join(__dirname, '..', 'templates')

const templateImportUtil = {
    getTemplate(filename: string, language = 'typescript') {
        if (!templateCache[filename]) {
            const contents = fsUtil
                .readFileSync(pathUtil.join(templatePath, language, filename))
                .toString()
            const template = handlebars.compile(contents)
            templateCache[filename] = template
        }

        return templateCache[filename]
    },
}

export default templateImportUtil
