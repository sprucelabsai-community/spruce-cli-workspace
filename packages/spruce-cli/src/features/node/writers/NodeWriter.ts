import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { DirectoryTemplateCode } from '@sprucelabs/spruce-templates'
import { GeneratedFile } from '../../../types/cli.types'
import AbstractWriter, {
	WriteDirectoryTemplateOptions,
	WriteResults,
} from '../../../writers/AbstractWriter'

export const NODE_FILES_TO_UPGRADE = [
	'tsconfig.json',
	'eslint.config.mjs',
	'.gitignore',
	'.nvmrc',
]
export default class NodeWriter extends AbstractWriter {
	public async writeNodeModule(
		destinationDir: string,
		options?: Partial<WriteDirectoryTemplateOptions> & {
			shouldWriteIndex?: boolean
		}
	): Promise<WriteResults> {
		let files: GeneratedFile[] = []
		if (options?.shouldWriteIndex !== false) {
			const contents = '//exports go here\n'
			const destination = diskUtil.resolvePath(
				destinationDir,
				'src',
				'index.ts'
			)
			diskUtil.writeFile(destination, contents)
			files.push({
				name: 'src/index.ts',
				description: 'Placeholder entry file!',
				action: 'generated',
				path: destination,
			})
		}

		const directoryTemplateFiles = await this.writeDirectoryTemplate({
			destinationDir,
			code: DirectoryTemplateCode.Skill,
			filesToWrite: NODE_FILES_TO_UPGRADE,
			context: { name: 'ignored', description: 'ignored' },
			...options,
		})

		return [...files, ...directoryTemplateFiles]
	}
}
