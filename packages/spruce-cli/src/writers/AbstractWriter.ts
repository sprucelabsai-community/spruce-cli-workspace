import fs from 'fs'
import pathUtil from 'path'
import { diskUtil, SettingsService } from '@sprucelabs/spruce-skill-utils'
import { DirectoryTemplateCode, Templates } from '@sprucelabs/spruce-templates'
import {
    FILE_ACTION_ALWAYS_SKIP,
    FILE_ACTION_OVERWRITE,
    FILE_ACTION_SKIP,
} from '../constants'
import LintService from '../services/LintService'
import { FileDescription, GeneratedFile, UpgradeMode } from '../types/cli.types'
import { GraphicsInterface } from '../types/cli.types'

export default abstract class AbstractWriter {
    protected templates: Templates
    protected ui: GraphicsInterface
    private linter?: LintService
    private upgradeMode: UpgradeMode
    private fileDescriptions: FileDescription[] = []
    private shouldConfirmBeforeWriting = true
    private firstFileWriteMessage?: string
    private hasShownFirstWriteMessage = false
    private settings: SettingsService<string>
    protected isLintEnabled = true

    public constructor(options: WriterOptions) {
        const {
            templates,
            term,
            upgradeMode,
            fileDescriptions,
            linter,
            settings,
        } = options

        this.templates = templates
        this.ui = term
        this.upgradeMode = upgradeMode
        this.fileDescriptions = fileDescriptions
        this.linter = linter
        this.settings = settings
    }

    protected async lint(file: string) {
        const shouldLint = !LintService.shouldIgnorePattern(file)
        if (this.isLintEnabled && shouldLint) {
            await this.linter?.fix(file).catch(() => {})
        }
    }

    protected async writeDirectoryTemplate(
        options: WriteDirectoryTemplateOptions
    ) {
        const {
            context,
            destinationDir,
            filesToWrite,
            filesToSkip,
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
            const shouldWrite =
                !filesToWrite || filesToWrite.indexOf(generated.filename) > -1
            const shouldSkip =
                filesToSkip && filesToSkip.indexOf(generated.filename) > -1

            if (shouldWrite && !shouldSkip) {
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
                write = await this.ui.confirm(
                    fileDescription.confirmPromptOnFirstWrite
                )
            }

            if (write) {
                diskUtil.writeFile(destination, contents)
                action = 'generated'
            }
        } else if (
            this.isFileDifferent(destination, contents) &&
            this.shouldOverwriteIfChanged(destination)
        ) {
            const cleanedName = this.cleanFilename(destination, cwd)
            const settings = { skipped: [], ...this.settings.get('writer') }
            const isAlwaysSkipped = settings.skipped.indexOf(cleanedName) > -1
            let write = !isAlwaysSkipped

            if (!isAlwaysSkipped && this.shouldAskForOverwrite()) {
                if (
                    !this.hasShownFirstWriteMessage &&
                    this.firstFileWriteMessage
                ) {
                    this.hasShownFirstWriteMessage = true
                    this.ui.renderLine(this.firstFileWriteMessage)
                    this.ui.renderLine('')
                }

                const answer = await this.ui.prompt({
                    type: 'select',
                    label: `${cleanedName}`,
                    options: {
                        choices: [
                            {
                                value: FILE_ACTION_OVERWRITE,
                                label: 'Overwrite',
                            },
                            {
                                value: FILE_ACTION_SKIP,
                                label: 'Skip',
                            },
                            {
                                value: FILE_ACTION_ALWAYS_SKIP,
                                label: 'Always skip',
                            },
                        ],
                    },
                })

                if (answer === FILE_ACTION_ALWAYS_SKIP) {
                    settings.skipped.push(cleanedName)
                    this.settings.set('writer', settings)
                }

                write = answer === FILE_ACTION_OVERWRITE
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

        await this.lint(destination)

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

    private getFileDescription(
        destination: string
    ): FileDescription | undefined {
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
        return isDir
            ? diskUtil.resolvePath(dirOrFile, fallbackFileName)
            : dirOrFile
    }
}

export type WriteResults = GeneratedFile[]

export interface WriterOptions {
    templates: Templates
    term: GraphicsInterface
    upgradeMode?: UpgradeMode
    fileDescriptions: FileDescription[]
    linter?: LintService
    settings: SettingsService
}

export interface WriteDirectoryTemplateOptions {
    destinationDir: string
    code: DirectoryTemplateCode
    filesToWrite?: string[]
    filesToSkip?: string[]
    context: any
    shouldConfirmBeforeWriting?: boolean
    firstFileWriteMessage?: string
}
