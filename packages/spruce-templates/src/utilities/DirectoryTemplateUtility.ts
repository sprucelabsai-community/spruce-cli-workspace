import fs from 'fs'
import path from 'path'
import globby from '@sprucelabs/globby'
import handlebars from 'handlebars'
import {
	DirectoryTemplateCode,
	DirectoryTemplateContextMap,
	DirectoryTemplateFile,
} from '../types/templates.types'

type DirectoryTemplateWithContent = DirectoryTemplateFile & {
	contents: string
}

export default class DirectoryTemplateUtility {
	public static async filesInTemplate(
		code: DirectoryTemplateCode
	): Promise<DirectoryTemplateFile[]> {
		const filePaths: DirectoryTemplateFile[] = []

		const files = await globby(
			path.join(__dirname, '../templates/directories', code),
			{
				dot: true,
			}
		)

		for (let i = 0; i < files.length; i += 1) {
			const file = files[i]
			const isDefinitionFile = file.search('.d.ts') > -1

			if (!isDefinitionFile) {
				const templateFile = this.loadFileDetails(code, file)
				filePaths.push(templateFile)
			}
		}

		return filePaths
	}

	public static async build<K extends DirectoryTemplateCode>(options: {
		/** The type of directory template to build */
		kind: K
		/** The data to pass into the templates */
		context?: DirectoryTemplateContextMap[K]
	}): Promise<DirectoryTemplateWithContent[]> {
		const builtFiles: DirectoryTemplateWithContent[] = []

		const { kind, context } = options

		const files = await this.filesInTemplate(kind)

		for (let i = 0; i < files.length; i += 1) {
			const file = files[i]
			const { isHandlebarsTemplate, path } = file

			let contents = fs.readFileSync(path).toString()

			if (isHandlebarsTemplate) {
				const compiledTemplate = handlebars.compile(contents)
				contents = compiledTemplate(context)
			}

			builtFiles.push({
				...file,
				contents,
			})
		}

		return builtFiles
	}

	private static loadFileDetails(
		code: DirectoryTemplateCode,
		filePath: string
	): DirectoryTemplateFile {
		const fullPath = path.resolve(filePath)

		const matches = fullPath.match(/(.*)\/([^/]+)$/)

		const directory = (matches && matches[1]) || ''
		const templateFilename = matches && matches[2]

		const fileMatches = templateFilename?.match(/(.*)\.hbs$/)
		let isHandlebarsTemplate = false
		let filename

		if (fileMatches && fileMatches[1]) {
			filename = fileMatches[1]
			isHandlebarsTemplate = true
		} else {
			filename = templateFilename
		}

		const root = path.join(__dirname, '..', 'templates', 'directories', code)
		const relativeBaseDirectory = path.relative(root, directory)

		if (
			!directory ||
			!filename ||
			typeof relativeBaseDirectory === 'undefined'
		) {
			throw new Error('INVALID_TEMPLATE_FILES')
		}

		return {
			isHandlebarsTemplate,
			directory,
			relativeDirectory: relativeBaseDirectory,
			filename,
			path: filePath,
			relativePath: path.join(relativeBaseDirectory, filename),
		}
	}
}
