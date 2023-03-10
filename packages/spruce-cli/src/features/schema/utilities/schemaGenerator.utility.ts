import pathUtil from 'path'
import globby from '@sprucelabs/globby'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'

const schemaGeneratorUtil = {
	async filterSchemaFilesBySchemaIds(
		lookupDir: string,
		schemas: { id: string; namespace?: string; version?: string }[]
	): Promise<string[]> {
		const matches = await globby(
			pathUtil.join(lookupDir, '/**/*.schema.[t|j]s')
		)
		const filtered = matches.filter((match) => {
			let found = false

			for (const schema of schemas) {
				const { id, namespace, version } = schema
				let regexString = `${pathUtil.sep}${id}.schema.[t|j]s`

				if (version) {
					regexString = pathUtil.sep + version + regexString
				}

				if (namespace) {
					regexString = namesUtil.toCamel(namespace) + regexString
				}

				const idx = match.search(new RegExp(regexString))
				if (idx > -1) {
					found = true
					break
				}
			}

			return !found
		})
		return filtered
	},
}

export default schemaGeneratorUtil
