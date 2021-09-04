import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { DirectoryTemplateCode } from '@sprucelabs/spruce-templates'
import AbstractWriter, { WriteResults } from '../../../writers/AbstractWriter'

export default class NodeWriter extends AbstractWriter {
	public async writeNodeModule(destinationDir: string): Promise<WriteResults> {
		const contents = '//exports go here\n'
		const destination = diskUtil.resolvePath(destinationDir, 'src', 'index.ts')

		diskUtil.writeFile(destination, contents)

		const files = await this.writeDirectoryTemplate({
			destinationDir,
			code: DirectoryTemplateCode.Skill,
			filesToWrite: [
				'tsconfig.json',
				'.eslintrc.js',
				'.eslintignore',
				'.gitignore',
				'.nvmrc',
			],
			context: { name: 'ignored', description: 'ignored' },
		})

		return [
			{
				name: 'src/index.ts',
				description: 'Placeholder entry file!',
				action: 'generated',
				path: destination,
			},
			...files,
		]
	}
}
