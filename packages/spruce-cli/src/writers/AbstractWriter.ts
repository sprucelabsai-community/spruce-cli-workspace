import fs from 'fs'
import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { DirectoryTemplateCode, Templates } from '@sprucelabs/spruce-templates'
import LintService from '../services/LintService'
import { FileDescription, GeneratedFile, UpgradeMode } from '../types/cli.types'
import { GraphicsInterface } from '../types/cli.types'

export type WriteResults = GeneratedFile[]

export interface WriterOptions {
	templates: Templates
	term: GraphicsInterface
	askBeforeUpdating?: boolean
	upgradeMode?: UpgradeMode
	fileDescriptions: FileDescription[]
	linter?: LintService
}

export default abstract class AbstractWriter {
	protected templates: Templates
	protected ui: GraphicsInterface
	private linter?: LintService
	private upgradeMode: UpgradeMode
	private fileDescriptions: FileDescription[] = []
	private shouldConfirmBeforeWriting = true
	private static isLintingEnabled = true
	private firstFileWriteMessage?: string
	private hasShownFirstWriteMessage = false

	public constructor(options: WriterOptions) {
		this.templates = options.templates
		this.ui = options.term
		this.upgradeMode = options.upgradeMode
		this.fileDescriptions = options.fileDescriptions
		this.linter = options.linter
	}

	protected async lint(file: string) {
		if (AbstractWriter.isLintingEnabled) {
			this.ui.startLoading(`Linting ${pathUtil.basename(file)}...`)
			await this.linter?.fix(file).catch(() => {})
		}
	}

	public static disableLinting() {
		this.isLintingEnabled = false
	}

	public static enableLinting() {
		this.isLintingEnabled = true
	}

	protected async writeDirectoryTemplate(options: {
		destinationDir: string
		code: DirectoryTemplateCode
		filesToWrite?: string[]
		context: any
		shouldConfirmBeforeWriting?: boolean
		firstFileWriteMessage?: string
	}) {
		const {
			context,
			destinationDir,
			filesToWrite,
			shouldConfirmBeforeWriting = true,
			firstFileWriteMessage,
		} = options

		this.shouldConfirmBeforeWriting = shouldConfirmBeforeWriting
		this.firstFileWriteMessage = firstFileWriteMessage
		this.hasShownFirstWriteMessage = false

		const files = await this.templates.directoryTemplate({
			kind: options.code,
			context: context ?? {},
		})

		let results: WriteResults = []

		for (const generated of files) {
			if (!filesToWrite || filesToWrite.indexOf(generated.filename) > -1) {
				results = await this.writeFileIfChangedMixinResults(
					pathUtil.join(destinationDir, generated.relativePath),
					generated.contents,
					'',
					results,
					destinationDir
				)
			}
		}

		return results
	}

	protected async writeFileIfChangedMixinResults(
		destination: string,
		contents: string,
		description: string,
		results?: WriteResults,
		cwd = ''
	): Promise<WriteResults> {
		const myResults: WriteResults = results ?? []
		let desc: string | undefined = description

		const name = pathUtil.basename(destination)
		let action: GeneratedFile['action'] = 'skipped'

		if (diskUtil.isDir(destination)) {
			throw new Error(`Can't write to a directory ${destination}.`)
		}

		const fileDescription = this.getFileDescription(destination)

		if (!diskUtil.doesFileExist(destination)) {
			let write = true
			if (
				this.shouldConfirmBeforeWriting &&
				fileDescription?.confirmPromptOnFirstWrite
			) {
				this.ui.stopLoading()
				write = await this.ui.confirm(fileDescription.confirmPromptOnFirstWrite)
			}

			if (write) {
				diskUtil.writeFile(destination, contents)
				action = 'generated'
			}
		} else if (
			this.isFileDifferent(destination, contents) &&
			this.shouldOverwriteIfChanged(destination)
		) {
			let write = true

			if (this.shouldAskForOverwrite()) {
				if (!this.hasShownFirstWriteMessage && this.firstFileWriteMessage) {
					this.hasShownFirstWriteMessage = true
					this.ui.renderLine(this.firstFileWriteMessage)
					this.ui.renderLine('')
				}

				let cleanedName = this.cleanFilename(destination, cwd)

				write = await this.ui.confirm(`Overwrite ${cleanedName}?`)
			}

			if (write) {
				diskUtil.writeFile(destination, contents)
				action = 'updated'
			}
		}

		if (!desc) {
			desc = fileDescription?.description
		}

		if (!desc) {
			throw new Error(
				`No FileDescription provided for ${destination.replace(
					cwd,
					''
				)}. Check your feature's fileDescriptions property.`
			)
		}

		myResults.push({ name, description: desc, path: destination, action })

		return myResults
	}

	private isFileDifferent(destination: string, contents: string) {
		return diskUtil.isFileDifferent(destination, contents)
	}

	private cleanFilename(destination: string, cwd: string) {
		let relativeFile = destination.replace(cwd, '')
		if (relativeFile[0] === pathUtil.sep) {
			relativeFile = relativeFile.substr(1)
		}
		return relativeFile
	}

	private shouldOverwriteIfChanged(destination: string): boolean {
		if (!this.upgradeMode) {
			return true
		}

		if (this.upgradeMode === 'forceEverything') {
			return true
		}

		let description: FileDescription | undefined =
			this.getFileDescription(destination)

		return description?.shouldOverwriteWhenChanged ?? false
	}

	private getFileDescription(destination: string): FileDescription | undefined {
		const lower = destination.toLowerCase()
		for (const d of this.fileDescriptions ?? []) {
			if (lower.search(d.path.toLowerCase()) > -1) {
				return d
			}
		}

		return undefined
	}

	private shouldAskForOverwrite() {
		if (
			this.shouldConfirmBeforeWriting &&
			this.upgradeMode === 'askForChanged'
		) {
			return true
		}

		return false
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
