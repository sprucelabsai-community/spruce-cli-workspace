import { SchemaError } from '@sprucelabs/schema'
import fs from 'fs-extra'
import SpruceError from '../errors/SpruceError'
import CommandService from './CommandService'

export default class LintService {
	public cwd: string
	private command: CommandService

	public constructor(cwd: string, command: CommandService) {
		this.cwd = cwd
		this.command = command
	}

	public fix = async (pattern: string): Promise<string[]> => {
		if (!pattern) {
			throw new SchemaError({
				code: 'MISSING_PARAMETERS',
				parameters: ['pattern'],
			})
		}

		let fixedFiles: any = {}
		const fixedPaths: string[] = []
		try {
			const script = `"(async function lint() { try { const { ESLint } = require('eslint'); const cli = new ESLint({ fix: true, cwd: '${this.cwd}', }); const result = await cli.lintFiles(['${pattern}']); console.log(JSON.stringify(result)); } catch (err) { console.log(err.toString()); }})()"`

			const { stdout } = await this.command.execute('node', {
				args: ['-e', script],
			})

			fixedFiles = JSON.parse(stdout)
		} catch (err: any) {
			throw new SpruceError({
				code: 'LINT_FAILED',
				pattern,
				originalError: err,
			})
		}

		if (fixedFiles) {
			for (let i = 0; i < fixedFiles.length; i += 1) {
				const fixedFile = fixedFiles[i]
				if (fixedFile && fixedFile.output) {
					await fs.writeFile(fixedFile.filePath, fixedFile.output)
					fixedPaths.push(fixedFile.filePath)
				}
			}
		}

		return fixedPaths
	}
}
