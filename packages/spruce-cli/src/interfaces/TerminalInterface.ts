import path from 'path'
import AbstractSpruceError from '@sprucelabs/error'
import globby from '@sprucelabs/globby'
import {
    FieldFactory,
    FieldDefinitionValueType,
    areSchemaValuesValid,
} from '@sprucelabs/schema'
import { IField } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
// @ts-ignore
import fonts from 'cfonts'
import chalk from 'chalk'
// @ts-ignore No definition available
import Table from 'cli-table3'
// @ts-ignore No definition available
import emphasize from 'emphasize'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import _ from 'lodash'
import { filter } from 'lodash'
import ora from 'ora'
import { terminal } from 'terminal-kit'
import { ProgressBarController } from 'terminal-kit/Terminal'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'
import SpruceError from '../errors/SpruceError'
import featuresUtil from '../features/feature.utilities'
import { ExecutionResults, GraphicsInterface } from '../types/cli.types'
import {
    GraphicsTextEffect,
    ImageDimensions,
    ProgressBarOptions,
    ProgressBarUpdateOptions,
} from '../types/graphicsInterface.types'
import durationUtil from '../utilities/duration.utility'
import isCi from '../utilities/isCi'

let fieldCount = 0
function generateInquirerFieldName() {
    fieldCount++
    return `field-${fieldCount}`
}

/** Remove effects cfonts does not support */
function filterEffectsForCFonts(effects: GraphicsTextEffect[]) {
    return filter(
        effects,
        (effect) =>
            [
                GraphicsTextEffect.SpruceHeader,
                GraphicsTextEffect.Reset,
                GraphicsTextEffect.Bold,
                GraphicsTextEffect.Dim,
                GraphicsTextEffect.Italic,
                GraphicsTextEffect.Underline,
                GraphicsTextEffect.Inverse,
                GraphicsTextEffect.Hidden,
                GraphicsTextEffect.Strikethrough,
                GraphicsTextEffect.Visible,
            ].indexOf(effect) === -1
    )
}

interface TerminalSpecificOptions {
    eraseBeforeRender?: boolean
}

export default class TerminalInterface implements GraphicsInterface {
    private static loader?: ora.Ora | null
    private static _doesSupportColor = process?.stdout?.isTTY && !isCi()
    public static ora = ora

    public isPromptActive = false
    public cwd: string
    private renderStackTraces = false
    private progressBar: ProgressBarController | null = null
    private log: (...args: any[]) => void

    public constructor(
        cwd: string,
        renderStackTraces = false,
        log = console.log.bind(console)
    ) {
        this.cwd = cwd
        this.renderStackTraces = renderStackTraces
        this.log = log
    }

    public static doesSupportColor() {
        return this._doesSupportColor
    }

    public static setDoesSupportColor(isTTy: boolean) {
        this._doesSupportColor = isTTy
    }

    public async sendInput(): Promise<void> {
        throw new Error('sendInput not supported on the TerminalInterface!')
    }

    public renderLines(lines: any[], effects?: GraphicsTextEffect[]) {
        lines.forEach((line) => {
            this.renderLine(line, effects)
        })
    }

    public renderObject(
        object: Record<string, any>,
        effects: GraphicsTextEffect[] = [GraphicsTextEffect.Green]
    ) {
        this.renderLine('')
        this.renderDivider()
        this.renderLine('')
        Object.keys(object).forEach((key) => {
            this.renderLine(
                `${chalk.bold(key)}: ${
                    typeof object[key] === 'string'
                        ? object[key]
                        : JSON.stringify(object[key])
                }`,
                effects
            )
        })
        this.renderLine('')
        this.renderDivider()
        this.renderLine('')
    }

    public renderSection(options: {
        headline?: string
        lines?: string[]
        object?: Record<string, any>
        headlineEffects?: GraphicsTextEffect[]
        bodyEffects?: GraphicsTextEffect[]
        dividerEffects?: GraphicsTextEffect[]
    }) {
        const {
            headline,
            lines,
            object,
            dividerEffects = [],
            headlineEffects = [
                GraphicsTextEffect.Blue,
                GraphicsTextEffect.Bold,
            ],
            bodyEffects = [GraphicsTextEffect.Green],
        } = options

        if (headline) {
            this.renderHeadline(
                `${headline} 🌲🤖`,
                headlineEffects,
                dividerEffects
            )
        }

        if (lines) {
            this.renderLines(lines, bodyEffects)

            this.renderLine('')
            this.renderDivider(dividerEffects)
        }

        if (object) {
            this.renderObject(object, bodyEffects)
        }

        this.renderLine('')
    }

    public renderDivider(effects?: GraphicsTextEffect[]) {
        const bar = '=================================================='
        this.renderLine(bar, effects)
    }

    public renderActionSummary(
        results: ExecutionResults & { totalTime?: number }
    ) {
        const generatedFiles =
            results.files?.filter((f) => f.action === 'generated') ?? []
        const updatedFiles =
            results.files?.filter((f) => f.action === 'updated') ?? []
        const skippedFiles =
            results.files?.filter((f) => f.action === 'skipped') ?? []

        const errors = results.errors ?? []
        const packagesInstalled = results.packagesInstalled ?? []
        const namespace = results.namespace

        this.renderHero(`${results.headline}`)

        let summaryLines: string[] = [
            namespace ? `Namespace: ${namespace}` : null,
            errors.length > 0 ? `Errors: ${errors.length}` : null,
            generatedFiles.length > 0
                ? `Generated files: ${generatedFiles.length}`
                : null,
            updatedFiles.length > 0
                ? `Updated files: ${updatedFiles.length}`
                : null,
            skippedFiles.length > 0
                ? `Skipped files: ${skippedFiles.length}`
                : null,
            packagesInstalled.length > 0
                ? `NPM packages installed: ${packagesInstalled.length}`
                : null,
            ...(results.summaryLines ?? []),
        ].filter((line) => !!line) as string[]

        if (summaryLines.length === 0) {
            summaryLines.push('Nothing to report!')
        }

        this.renderSection({
            headline: `${featuresUtil.generateCommand(
                results.featureCode,
                results.actionCode
            )} summary`,
            lines: summaryLines,
        })

        if (packagesInstalled.length > 0) {
            const table = new Table({
                head: ['Name', 'Dev'],
                colWidths: [40, 5],
                wordWrap: true,
                colAligns: ['left', 'center'],
            })

            packagesInstalled
                .sort((one, two) => (one.name > two.name ? 1 : -1))
                .forEach((pkg) => {
                    table.push([pkg.name, pkg.isDev ? '√' : ''])
                })

            this.renderSection({
                headline: `NPM packages summary`,
                lines: [table.toString()],
            })
        }

        for (let files of [generatedFiles, updatedFiles]) {
            if (files.length > 0) {
                const table = new Table({
                    head: ['File', 'Description'],
                    wordWrap: true,
                })

                files = files.sort()

                for (const file of files) {
                    table.push([file.name, file.description ?? ''])
                }

                this.renderSection({
                    headline: `${namesUtil.toPascal(files[0].action)} file summary`,
                    lines: [table.toString()],
                })
            }
        }

        if (results.hints) {
            this.renderSection({
                headline: 'Read below 👇',
                lines: results.hints,
            })
        }

        if (errors.length > 0) {
            this.renderHeadline('Errors')
            errors.forEach((err) => this.renderError(err))
        }

        if (results.totalTime) {
            this.renderLine(
                `Total time: ${durationUtil.msToFriendly(results.totalTime)}`
            )
        }
    }

    public renderHeadline(
        message: string,
        effects: GraphicsTextEffect[] = [
            GraphicsTextEffect.Blue,
            GraphicsTextEffect.Bold,
        ],
        dividerEffects: GraphicsTextEffect[] = []
    ) {
        const isSpruce = effects.indexOf(GraphicsTextEffect.SpruceHeader) > -1

        if (isSpruce && TerminalInterface.doesSupportColor()) {
            fonts.say(message, {
                font: GraphicsTextEffect.SpruceHeader,
                align: 'left',
                space: false,
                colors: filterEffectsForCFonts(effects),
            })
        } else {
            this.renderDivider(dividerEffects)
            this.renderLine(message, effects)
            this.renderDivider(dividerEffects)
            this.renderLine('')
        }
    }

    public setTitle(title: string): void {
        process.stdout.write('\x1b]2;' + title + '\x07')
    }

    public renderHero(message: string, effects?: GraphicsTextEffect[]) {
        if (!TerminalInterface.doesSupportColor()) {
            this.renderLine(message)
            return
        }

        const shouldStripVowels = process.stdout.columns < 80

        let stripped = shouldStripVowels
            ? message.replace(/[aeiou]/gi, '')
            : message

        if (
            shouldStripVowels &&
            ['a', 'e', 'i', 'o', 'u'].indexOf(message[0].toLowerCase()) > -1
        ) {
            stripped = `${message[0]}${stripped}`
        }

        fonts.say(stripped, {
            align: 'left',
            gradient: [GraphicsTextEffect.Red, GraphicsTextEffect.Blue],
            colors: effects ? filterEffectsForCFonts(effects) : undefined,
        })
    }

    public renderHint(message: string) {
        return this.renderLine(`👨‍🏫 ${message}`)
    }

    public renderLine(
        message: any,
        effects: GraphicsTextEffect[] = [],
        options?: TerminalSpecificOptions
    ) {
        let write: any = chalk
        effects.forEach((effect) => {
            write = write[effect]
        })

        if (options?.eraseBeforeRender) {
            terminal.eraseLine()
        }

        this.log(effects.length > 0 ? write(message) : message)
    }

    public renderWarning(message: string) {
        this.renderLine(`⚠️ ${message}`, [
            GraphicsTextEffect.Bold,
            GraphicsTextEffect.Yellow,
        ])
    }

    public async startLoading(message?: string) {
        this.stopLoading()
        if (!this.isPromptActive) {
            TerminalInterface.loader = TerminalInterface.ora({
                text: message,
            }).start()
        }
    }

    public stopLoading() {
        TerminalInterface.loader?.stop()
        TerminalInterface.loader = null
    }

    public async confirm(question: string): Promise<boolean> {
        const confirmResult = await inquirer.prompt({
            type: 'confirm',
            name: 'answer',
            message: question,
        })

        return !!confirmResult.answer
    }

    public async waitForEnter(message?: string) {
        await this.prompt({
            type: 'text',
            label: `${message ? message + ' ' : ''}${chalk.bgGreenBright.black(
                'hit enter'
            )}`,
        })
        this.renderLine('')
        return
    }

    public clear() {
        void this.stopLoading()
        console.clear()
    }

    public renderCodeSample(code: string) {
        try {
            const colored = emphasize.highlight('js', code).value
            this.renderLine(colored)
        } catch (err: any) {
            this.renderWarning(err)
        }
    }

    public async prompt<T extends FieldDefinitions>(
        definition: T
    ): Promise<FieldDefinitionValueType<T>> {
        this.isPromptActive = true
        const name = generateInquirerFieldName()
        const fieldDefinition: FieldDefinitions = definition
        const { defaultValue } = fieldDefinition

        const promptOptions: Record<string, any> = {
            default: defaultValue,
            name,
            message: this.generatePromptLabel(fieldDefinition),
        }

        const field = FieldFactory.Field('prompt', fieldDefinition)

        promptOptions.transformer = (value: string) => {
            return (field as IField<any>).toValueType(value)
        }

        promptOptions.validate = (value: string) => {
            return areSchemaValuesValid(
                {
                    id: 'promptvalidateschema',
                    fields: {
                        prompt: fieldDefinition,
                    },
                },
                { prompt: value }
            )
            // return field.validate(value, {}).length === 0
        }

        switch (fieldDefinition.type) {
            // Map select options to prompt list choices
            case 'boolean':
                promptOptions.type = 'confirm'
                break

            case 'select':
                promptOptions.type = fieldDefinition.isArray
                    ? 'checkbox'
                    : 'list'

                promptOptions.choices = fieldDefinition.options.choices.map(
                    // @ts-ignore
                    (choice) => ({
                        name: choice.label,
                        value: choice.value,
                        checked: _.includes(
                            fieldDefinition.defaultValue,
                            choice.value
                        ),
                    })
                )

                break
            // Directory select
            // File select
            case 'directory': {
                if (fieldDefinition.isArray) {
                    throw new SpruceError({
                        code: 'NOT_IMPLEMENTED',
                        friendlyMessage:
                            'isArray file field not supported, prompt needs to be rewritten with isArray support',
                    })
                }

                const dirPath = path.join(
                    fieldDefinition.defaultValue?.path ?? this.cwd,
                    '/'
                )

                promptOptions.type = 'file'
                promptOptions.root = dirPath
                promptOptions.onlyShowDir = true

                // Only let people select an actual file
                promptOptions.validate = (value: string) => {
                    return (
                        fs.existsSync(value) &&
                        fs.lstatSync(value).isDirectory()
                    )
                }
                // Strip out cwd from the paths while selecting
                promptOptions.transformer = (path: string) => {
                    const cleanedPath = path.replace(promptOptions.root, '')
                    return cleanedPath.length === 0
                        ? promptOptions.root
                        : cleanedPath
                }
                break
            }
            case 'file': {
                if (fieldDefinition.isArray) {
                    throw new SpruceError({
                        code: 'NOT_IMPLEMENTED',
                        friendlyMessage:
                            'isArray file field not supported, prompt needs to be rewritten with isArray support',
                    })
                }
                const dirPath = path.join(
                    fieldDefinition.defaultValue?.uri ?? this.cwd,
                    '/'
                )

                // Check if directory is empty.
                const files = await globby(`${dirPath}**/*`)

                if (files.length === 0) {
                    throw new SpruceError({
                        code: 'DIRECTORY_EMPTY',
                        directory: dirPath,
                        friendlyMessage: `I wanted to help you select a file, but none exist in ${dirPath}.`,
                    })
                }

                promptOptions.type = 'file'
                promptOptions.root = dirPath

                // Only let people select an actual file
                promptOptions.validate = (value: string) => {
                    return (
                        fs.existsSync(value) &&
                        !fs.lstatSync(value).isDirectory() &&
                        path.extname(value) === '.ts'
                    )
                }
                // Strip out cwd from the paths while selecting
                promptOptions.transformer = (path: string) => {
                    const cleanedPath = path.replace(promptOptions.root, '')
                    return cleanedPath.length === 0
                        ? promptOptions.root
                        : cleanedPath
                }
                break
            }

            // Defaults to input
            default:
                promptOptions.type = 'input'
        }

        const response = (await inquirer.prompt(promptOptions)) as any

        this.isPromptActive = false

        const result =
            typeof response[name] !== 'undefined'
                ? (field as IField<any>).toValueType(response[name])
                : response[name]

        return result
    }
    private generatePromptLabel(fieldDefinition: FieldDefinitions): any {
        let label = fieldDefinition.label

        if (fieldDefinition.hint) {
            label = `${label} ${chalk.italic.dim(`(${fieldDefinition.hint})`)}`
        }

        label = label + ': '

        return label
    }

    public renderError(err: Error) {
        this.stopLoading()

        const message = err.message
        // Remove message from stack so the message is not doubled up
        const stackLines = this.cleanStack(err)
        this.renderSection({
            headline: message,
            lines: this.renderStackTraces
                ? stackLines.splice(0, 100)
                : undefined,
            headlineEffects: [GraphicsTextEffect.Bold, GraphicsTextEffect.Red],
            dividerEffects: [GraphicsTextEffect.Red],
            bodyEffects: [GraphicsTextEffect.Red],
        })
    }

    private cleanStack(err: Error) {
        const message = err.message
        let stack = err.stack ? err.stack.replace(message, '') : ''

        if (err instanceof AbstractSpruceError) {
            let original = err.originalError
            while (original) {
                stack = stack.replace('Error: ' + original.message, '')
                original = (original as AbstractSpruceError).originalError
            }
        }

        const stackLines = stack.split('\n')

        return stackLines
    }

    public renderProgressBar(options: ProgressBarOptions): void {
        this.removeProgressBar()
        this.progressBar = terminal.progressBar({
            ...options,
            percent: options.showPercent,
            eta: options.showEta,
            items: options.totalItems,
            inline: options.renderInline,
        })
    }

    public removeProgressBar() {
        if (this.progressBar) {
            this.progressBar.stop()
            this.progressBar = null
        }
    }

    public updateProgressBar(options: ProgressBarUpdateOptions): void {
        if (this.progressBar) {
            this.progressBar.update({
                ...options,
                items: options.totalItems,
            })
        }
    }

    public async renderImage(
        _path: string,
        _options?: ImageDimensions
    ): Promise<void> {
        // const image = await terminalImage.file(path, options)
        this.renderLine('Images not supported....')
    }

    public async getCursorPosition(): Promise<{ x: number; y: number } | null> {
        return new Promise((resolve) => {
            terminal.requestCursorLocation()
            terminal.getCursorLocation((err, x, y) => {
                resolve(err ? null : { x: x ?? 0, y: y ?? 0 })
            })
        })
    }

    public saveCursor() {
        terminal.saveCursor()
    }

    public restoreCursor() {
        terminal.restoreCursor()
    }

    public moveCursorTo(x: number, y: number): void {
        terminal.moveTo(x, y)
    }

    public clearBelowCursor(): void {
        terminal.eraseDisplayBelow()
    }

    public eraseLine() {
        terminal.eraseLine()
    }
}
