import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractWriter from '../../../writers/AbstractWriter'

export default class PermissionWriter extends AbstractWriter {
	public async writeTypesFile(destinationDir: string) {
		const destination = diskUtil.resolveHashSprucePath(
			destinationDir,
			'permissions',
			'permissions.types.ts'
		)

		const files = await this.writeFileIfChangedMixinResults(
			destination,
			'',
			'Types file for any permission contracts you created or depend on.'
		)

		return files
	}

	public async writeContract(
		destinationDir: string,
		options: {
			nameReadable: string
			nameKebab: string
			nameCamel: string
			description?: string
		}
	) {
		const { nameReadable, nameKebab, nameCamel, description } = options

		const destination = diskUtil.resolvePath(
			destinationDir,
			`${nameKebab}.permissions.ts`
		)

		const content = this.templates.permissionContractBuilder({
			nameCamel,
			nameKebab,
			description,
			nameReadable,
		})

		const files = await this.writeFileIfChangedMixinResults(
			destination,
			content,
			'Your brand new permissions contract!'
		)

		await this.lint(destination)

		return files
	}
}
