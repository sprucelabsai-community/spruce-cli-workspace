import pathUtil from 'path'
import { Schema } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'

const featuresUtil = {
	/**
	 * @deprecated move to code prop on action
	 */
	filePathToActionCode(path: string): string {
		const parts = path.split(pathUtil.sep)
		const name = parts.pop() ?? ''
		const ext = pathUtil.extname(name)
		const nameNoExt = name.substr(0, name.length - ext.length)
		const code = nameNoExt.replace('Action', '')

		const hyphened = namesUtil.toKebab(code)

		return hyphened.replace(/-/g, '.').toLowerCase()
	},

	generateCommand(featureCode: string, actionCode: string) {
		if (featureCode === actionCode) {
			return featureCode
		}

		return `${actionCode}.${featureCode}`
	},

	generateOptionAliases(schema: Schema): Record<string, string> {
		const fields = schema.fields || {}
		const aliases: Record<string, string> = {}

		Object.keys(fields).forEach((fieldName: string) => {
			const fullName = `${fieldName}`

			let placeholder = ''
			const field = fields[fieldName]
			const type = field.type
			if (type !== 'boolean') {
				placeholder = ` <${fullName}>`
			} else {
				placeholder = ` [true|false]`
			}

			const fullNameWithPlaceholder = `--${fullName}${placeholder}`

			aliases[fieldName] = fullNameWithPlaceholder
		})

		return aliases
	},
}

export default featuresUtil
