import pathUtil from 'path'
import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { SchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import open from 'open'
import testOptionsSchema from '#spruce/schemas/spruceCli/v2020_07_22/testOptions.schema'
import SpruceError from '../../../errors/SpruceError'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse, ActionOptions } from '../../features.types'
import WatchFeature from '../../watch/WatchFeature'
import {
    SpruceTestFile,
    SpruceTestFileTest,
    SpruceTestResults,
} from '../test.types'
import TestReporter, { WatchMode } from '../TestReporter'
import TestRunner from '../TestRunner'

export const optionsSchema = testOptionsSchema

export type OptionsSchema = typeof optionsSchema

type DidChangePayload =
    SchemaValues<SpruceSchemas.SpruceCli.v2020_07_22.WatcherDidDetectChangesEmitPayloadSchema>

export default class TestAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public invocationMessage = 'Starting tests... 🛡'

    private testReporter?: TestReporter | undefined
    private testRunner?: TestRunner
    private runnerStatus: 'hold' | 'quit' | 'run' | 'restart' = 'hold'
    private pattern: string | undefined
    private inspect?: number | null
    private holdPromiseResolve?: () => void
    private lastTestResults: SpruceTestResults = { totalTestFiles: 0 }
    private originalInspect!: number
    private watcher?: WatchFeature
    private watchMode: WatchMode = 'off'
    private isRpTraining = false
    private fileChangeTimeout?: any
    private hasWatchEverBeenEnabled = false

    private readonly watchDelaySec = 2

    public constructor(options: ActionOptions) {
        super(options)
    }

    public async execute(
        options: SchemaValues<OptionsSchema>
    ): Promise<FeatureActionResponse> {
        if (!options.watchMode) {
            const settings = this.Service('settings')
            options.watchMode = settings.get('test.watchMode') ?? 'off'
        }

        const normalizedOptions = this.validateAndNormalizeOptions(options)

        const {
            pattern,
            shouldReportWhileRunning,
            inspect,
            shouldHoldAtStart,
            watchMode,
            shouldReturnImmediately,
        } = normalizedOptions

        this.originalInspect = inspect ?? 5200
        this.inspect = inspect
        this.pattern = pattern
        this.hasWatchEverBeenEnabled = watchMode !== 'off'
        this.watchMode = watchMode as WatchMode

        if (shouldReportWhileRunning) {
            this.testReporter = new TestReporter({
                cwd: this.cwd,
                watchMode: this.watchMode,
                status: shouldHoldAtStart ? 'stopped' : 'ready',
                isDebugging: !!inspect,
                filterPattern: pattern ?? undefined,
                isRpTraining: this.isRpTraining,
                handleRestart: this.handleRestart.bind(this),
                handleStartStop: this.handleStartStop.bind(this),
                handleQuit: this.handleQuit.bind(this),
                handleRerunTestFile: this.handleRerunTestFile.bind(this),
                handleOpenTestFile: this.handleOpenTestFile.bind(this),
                handleFilterPatternChange:
                    this.handleFilterPatternChange.bind(this),
                handleToggleDebug: this.handleToggleDebug.bind(this),
                handletoggleStandardWatch:
                    this.handletoggleStandardWatch.bind(this),
                handleToggleSmartWatch: this.handleToggleSmartWatch?.bind(this),
                handleToggleRpTraining: this.handleToggleRpTraining?.bind(this),
            })

            await this.testReporter.start()
        }

        this.watcher = this.getFeature('watch') as WatchFeature
        void this.watcher.startWatching({ delay: 0 })

        await this.emitter.on(
            'watcher.did-detect-change',
            this.handleFileChange.bind(this)
        )

        this.runnerStatus = shouldHoldAtStart ? 'hold' : 'run'

        const promise = this.startTestRunner(normalizedOptions)

        if (shouldReturnImmediately) {
            return {
                meta: {
                    promise,
                    test: this,
                },
            }
        }

        void this.emitter.emit('test.reporter-did-boot', {
            reporter: this,
        })

        const testResults = await promise

        await this.watcher?.stopWatching()
        await this.testReporter?.destroy()

        const actionResponse: FeatureActionResponse = {
            meta: { testResults },
            summaryLines: [
                `Test files: ${testResults.totalTestFiles}`,
                `Tests: ${testResults.totalTests ?? '0'}`,
                `Passed: ${testResults.totalPassed ?? '0'}`,
                `Failed: ${testResults.totalFailed ?? '0'}`,
                `Skipped: ${testResults.totalSkipped ?? '0'}`,
                `Todo: ${testResults.totalTodo ?? '0'}`,
            ],
        }

        if (testResults.totalFailed ?? 0 > 0) {
            actionResponse.errors =
                this.generateErrorsFromTestResults(testResults)
        }

        return actionResponse
    }

    private handleFileChange(payload: DidChangePayload) {
        if (
            this.watchMode === 'off' ||
            !(this.runnerStatus === 'run' || this.runnerStatus == 'hold')
        ) {
            return
        }

        const { changes } = payload

        let shouldRestart = false
        const filesWeCareAbout: string[] = []

        for (const change of changes) {
            const { path, name } = change.values

            if (this.doWeCareAboutThisFileChanging(path)) {
                this.testReporter?.setStatusLabel(`Built file: ${name}`)
                shouldRestart = true
                filesWeCareAbout.push(path)
                break
            }
        }

        if (shouldRestart) {
            if (this.fileChangeTimeout) {
                clearTimeout(this.fileChangeTimeout)
            }

            this.testReporter?.startCountdownTimer(this.watchDelaySec)
            this.fileChangeTimeout = setTimeout(() => {
                if (this.watchMode === 'smart') {
                    const smartFilter =
                        this.generateFilterFromChangedFiles(filesWeCareAbout)
                    if (smartFilter.length > 0) {
                        this.handleFilterPatternChange(smartFilter)
                    } else {
                        this.restart()
                    }
                } else {
                    this.restart()
                }
            }, this.watchDelaySec * 1000) as any
        }
    }

    private generateFilterFromChangedFiles(filesWeCareAbout: string[]): string {
        const filter = filesWeCareAbout
            .filter((file) => file.search('test.js') > -1)
            .map((file) => this.fileToFilterPattern(file))
            .join(' ')

        return filter
    }

    private doWeCareAboutThisFileChanging(path: string) {
        const ext = pathUtil.extname(path)

        if (
            path.search('testDirsAndFiles') > -1 ||
            path.search('.change_cache') > -1
        ) {
            return false
        }

        if (ext === '.js') {
            return true
        }

        return false
    }

    private handleToggleDebug() {
        if (this.inspect) {
            this.inspect = undefined
        } else {
            this.inspect = this.originalInspect
        }

        this.testReporter?.setIsDebugging(!!this.inspect)
        this.restart()
    }

    private handletoggleStandardWatch() {
        if (this.watchMode === 'standard') {
            this.testReporter?.setWatchMode('off')
        } else {
            this.setWatchMode('standard')
        }
    }

    private handleToggleSmartWatch() {
        if (this.watchMode === 'smart') {
            this.setWatchMode('off')
        } else {
            this.setWatchMode('smart')
        }
    }

    private async handleToggleRpTraining() {
        // this.isRpTraining = !this.isRpTraining
        // this.testReporter?.setIsRpTraining(this.isRpTraining)
        // if (this.isRpTraining) {
        await this.testReporter?.askForTrainingToken()
        // }
    }

    public setWatchMode(mode: WatchMode) {
        this.watchMode = mode
        this.testReporter?.setWatchMode(mode)
        this.hasWatchEverBeenEnabled = true
    }

    private restart() {
        this.runnerStatus = 'restart'
        this.kill()
    }

    private handleQuit() {
        this.runnerStatus = 'quit'
        this.kill()
    }

    private handleRerunTestFile(file: string) {
        const name = this.fileToFilterPattern(file)

        this.testReporter?.setFilterPattern(name)
        this.handleFilterPatternChange(name)
    }

    private fileToFilterPattern(file: string) {
        const filename = pathUtil
            .basename(file, '.ts')
            .replace('.tsx', '')
            .replace('.js', '')
        const dirname = pathUtil.dirname(file).split(pathUtil.sep).pop() ?? ''

        const name = pathUtil.join(dirname, filename)
        return name
    }

    private handleFilterPatternChange(filterPattern?: string) {
        this.pattern = filterPattern
        this.testReporter?.setFilterPattern(filterPattern)

        this.restart()
    }

    private handleStartStop() {
        if (this.runnerStatus === 'hold') {
            this.runnerStatus = 'run'
            this.holdPromiseResolve?.()
            this.holdPromiseResolve = undefined
        } else if (this.runnerStatus === 'run') {
            this.runnerStatus = 'hold'
            this.kill()
        }
    }

    private handleRestart() {
        this.restart()
    }

    public kill() {
        this.testRunner?.kill()
        this.holdPromiseResolve?.()
        this.holdPromiseResolve = undefined
    }

    private async handleOpenTestFile(fileName: string) {
        await this.openTestFile(fileName)
    }

    private async startTestRunner(
        options: SchemaValues<OptionsSchema>
    ): Promise<SpruceTestResults> {
        if (this.runnerStatus === 'hold') {
            await this.waitForStart()
        }

        if (this.runnerStatus === 'quit') {
            return this.lastTestResults
        }

        this.testReporter?.setStatus('ready')
        this.testReporter?.stopCountdownTimer()

        this.testRunner = new TestRunner({
            cwd: this.cwd,
            commandService: this.Service('command'),
        })

        let firstUpdate = true

        if (this.testReporter) {
            await this.testRunner.on('did-update', (payload) => {
                if (firstUpdate) {
                    firstUpdate = false
                    this.testReporter?.setStatus('running')
                    this.testReporter?.reset()
                }

                if (
                    this.watchMode === 'smart' &&
                    payload.results.totalFailed > 0
                ) {
                    const failed = payload.results.testFiles.find(
                        (file: any) => file.status === 'failed'
                    )

                    if (failed) {
                        const pattern = this.fileToFilterPattern(failed.path)
                        if (this.pattern !== pattern) {
                            this.handleFilterPatternChange(pattern)
                        }
                        return
                    }
                }

                this.testReporter?.updateResults(payload.results)
                this.testReporter?.render()
            })

            await this.testRunner.on('did-error', (payload) => {
                this.testReporter?.appendError(payload.message)
                this.testReporter?.render()
            })
        }

        this.runnerStatus = 'run'

        let testResults: SpruceTestResults = await this.testRunner.run({
            pattern: this.pattern,
            debugPort: this.inspect,
        })

        if (
            //@ts-ignore
            this.runnerStatus !== 'restart' &&
            (!options.shouldReportWhileRunning ||
                !this.hasWatchEverBeenEnabled ||
                (this.runnerStatus as any) === 'quit')
        ) {
            return testResults
        }

        if (
            this.runnerStatus === 'run' &&
            this.watchMode === 'smart' &&
            this.testRunner?.hasFailedTests() === false &&
            !this.testRunner?.hasSkippedTests() &&
            (this.pattern ?? []).length > 0
        ) {
            this.testReporter?.setStatusLabel('Restarting...')
            this.runnerStatus = 'restart'
            this.testReporter?.startCountdownTimer(3)

            return await new Promise((resolve) => {
                setTimeout(() => {
                    this.pattern = ''
                    this.testReporter?.setFilterPattern('')
                    resolve(this.startTestRunner(options))
                }, 3000)
            })
        }

        if (this.runnerStatus === 'run') {
            this.runnerStatus = 'hold'
        }

        this.testReporter?.setStatus('stopped')

        this.lastTestResults = testResults

        return this.startTestRunner(options)
    }

    public async waitForStart() {
        await new Promise((resolve: any) => {
            this.runnerStatus = 'hold'
            this.holdPromiseResolve = resolve
        })
    }

    private async openTestFile(fileName: string): Promise<void> {
        const path = diskUtil.resolvePath(
            this.cwd,
            'src',
            '__tests__',
            fileName
        )
        await open(path)
    }

    private generateErrorsFromTestResults(testResults: SpruceTestResults) {
        const errors: SpruceError[] = []
        testResults.testFiles?.forEach((file) => {
            file.tests?.forEach((test) => {
                test.errorMessages?.forEach((message) => {
                    const err = this.mapErrorResultToSpruceError(
                        test,
                        file,
                        message
                    )
                    errors.push(err)
                })
            })
        })
        if (errors.length > 0) {
            return errors
        }

        return undefined
    }

    private mapErrorResultToSpruceError(
        test: SpruceTestFileTest,
        file: SpruceTestFile,
        message: string
    ) {
        return new SpruceError({
            code: 'TEST_FAILED',
            testName: test.name,
            fileName: file.path,
            errorMessage: message,
        })
    }

    public getWatchMode() {
        return this.watchMode
    }
}
