import fs from 'fs'
import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { Templates } from '@sprucelabs/spruce-templates'
import { GeneratedFile, GraphicsInterface } from '../types/cli.types'

export type GenerationResults = GeneratedFile[]

export interface GeneratorOptions {
	templates: Templates
	term: GraphicsInterface
	askBeforeUpdating?: boolean
}

export default abstract class AbstractGenerator {
	protected templates: Templates
	private askBeforeUpdating = false
	private ui: GraphicsInterface

	public constructor(options: GeneratorOptions) {
		this.templates = options.templates
		this.ui = options.term
		this.askBeforeUpdating = !!options.askBeforeUpdating
	}

	protected async writeFileIfChangedMixinResults(
		destination: string,
		contents: string,
		description: string,
		results?: GenerationResults
	): Promise<GenerationResults> {
		const myResults: GenerationResults = results ?? []

		const name = pathUtil.basename(destination)
		let action: GeneratedFile['action'] = 'skipped'

		if (diskUtil.isDir(destination)) {
			throw new Error(`Can't write to a directory ${destination}.`)
		}

		if (!diskUtil.doesFileExist(destination)) {
			diskUtil.writeFile(destination, contents)
			action = 'generated'
		} else if (diskUtil.isFileDifferent(destination, contents)) {
			let write = true
			if (this.askBeforeUpdating) {
				write = await this.ui.confirm(`Overwrite ${destination}?`)
			}

			if (write) {
				diskUtil.writeFile(destination, contents)
				action = 'updated'
			}
		}

		myResults.push({ name, description, path: destination, action })

		return myResults
	}

	protected resolveFilenameWithFallback(
		dirOrFile: string,
		fallbackFileName: string
	) {
		const isDir =
			diskUtil.doesDirExist(dirOrFile) &&
			fs.lstatSync(dirOrFile).isDirectory() &&
			pathUtil.extname(dirOrFile).length === 0
		return isDir ? diskUtil.resolvePath(dirOrFile, fallbackFileName) : dirOrFile
	}
}