import { PermissionContractMap } from '@sprucelabs/mercury-types'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractWriter from '../../../writers/AbstractWriter'
import { ImportedPermission } from '../stores/PermissionStore'

export default class PermissionWriter extends AbstractWriter {
	public async writeTypesFile(
		destinationDir: string,
		map: PermissionContractMap
	) {
		const destination = diskUtil.resolveHashSprucePath(
			destinationDir,
			'permissions',
			'permissions.types.ts'
		)

		const contents = this.templates.permissionTypes({ contracts: map })

		const files = await this.writeFileIfChangedMixinResults(
			destination,
			contents,
			'Types file for any permission contracts you created or depend on.'
		)

		return files
	}

	public async writeCombineFile(
		destinationDir: string,
		options: {
			contracts: ImportedPermission[]
		}
	) {
		const { contracts } = options

		const destinationPath = diskUtil.resolveHashSprucePath(
			destinationDir,
			'permissions'
		)
		const destinationFile = diskUtil.resolvePath(
			destinationPath,
			'permissions.ts'
		)

		const local = contracts.map((c) => ({
			nameCamel: namesUtil.toCamel(c.id),
			path: diskUtil.resolveRelativePath(
				destinationPath,
				c.path.replace('.ts', '')
			),
		}))

		const content = this.templates.permissions({ contracts: local })

		const files = await this.writeFileIfChangedMixinResults(
			destinationFile,
			content,
			'Import of all permission contracts for loading on boot!'
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
