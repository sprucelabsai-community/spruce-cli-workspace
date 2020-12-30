import chalk from 'chalk'
import durationUtil from '../../utilities/duration.utility'
import { ButtonWidget } from '../../widgets/types/button.types'
import { InputWidget } from '../../widgets/types/input.types'
import { LayoutWidget } from '../../widgets/types/layout.types'
import { MenuBarWidget } from '../../widgets/types/menuBar.types'
import { PopupWidget } from '../../widgets/types/popup.types'
import { ProgressBarWidget } from '../../widgets/types/progressBar.types'
import { TextWidget } from '../../widgets/types/text.types'
import { WindowWidget } from '../../widgets/types/window.types'
import WidgetFactory from '../../widgets/WidgetFactory'
import { SpruceTestResults, TestRunnerStatus } from './test.types'
import TestLogItemGenerator from './TestLogItemGenerator'

interface TestReporterOptions {
	handleStartStop?: () => void
	handleRestart?: () => void
	handleQuit?: () => void
	onRequestOpenTestFile?: () => void
	handleRerunTestFile?: (fileName: string) => void
	handleOpenTestFile?: (fileName: string) => void
	handleFilterPatternChange?: (pattern?: string) => void
	handleToggleDebug?: () => void
	handleToggleWatchAll?: () => void
	handleToggleSmartWatch?: () => void
	filterPattern?: string
	isDebugging?: boolean
	watchMode?: WatchMode
	status?: TestRunnerStatus
	cwd?: string
}

type TestReporterResults = SpruceTestResults & {
	customErrors: string[]
}

export type TestEporterOrientation = 'landscape' | 'portrait'

export type WatchMode = 'off' | 'all' | 'smart'

export default class TestReporter {
	private started = false
	private table?: any
	private bar!: ProgressBarWidget
	private layout!: LayoutWidget
	private testLog!: TextWidget
	private errorLog?: TextWidget
	private errorLogItemGenerator: TestLogItemGenerator
	private lastResults: TestReporterResults = {
		totalTestFiles: 0,
		customErrors: [],
	}
	private updateInterval?: any
	private menu!: MenuBarWidget
	private window!: WindowWidget
	private widgetFactory: WidgetFactory
	private selectTestPopup?: PopupWidget
	private topLayout!: LayoutWidget
	private filterInput!: InputWidget
	private filterPattern?: string
	private clearFilterPatternButton!: ButtonWidget
	private isDebugging = false
	private watchMode: WatchMode = 'off'
	private status: TestRunnerStatus = 'ready'
	private countDownTimeInterval?: number
	private cwd: string | undefined
	private orientation: TestEporterOrientation = 'landscape'

	private handleStartStop?: () => void
	private handleRestart?: () => void
	private handleQuit?: () => void
	private handleRerunTestFile?: (fileName: string) => void
	private handleFilterChange?: (pattern?: string) => void
	private handleOpenTestFile?: (testFile: string) => void
	private handleToggleDebug?: () => void
	private handleToggleWatchAll?: () => void
	private handleToggleSmartWatch?: () => any

	public constructor(options?: TestReporterOptions) {
		this.cwd = options?.cwd
		this.filterPattern = options?.filterPattern
		this.handleRestart = options?.handleRestart
		this.handleStartStop = options?.handleStartStop
		this.handleQuit = options?.handleQuit
		this.handleRerunTestFile = options?.handleRerunTestFile
		this.handleOpenTestFile = options?.handleOpenTestFile
		this.handleFilterChange = options?.handleFilterPatternChange
		this.status = options?.status ?? 'ready'
		this.handleToggleDebug = options?.handleToggleDebug
		this.handleToggleWatchAll = options?.handleToggleWatchAll
		this.isDebugging = options?.isDebugging ?? false
		this.watchMode = options?.watchMode ?? 'off'
		this.handleToggleSmartWatch = options?.handleToggleSmartWatch

		this.errorLogItemGenerator = new TestLogItemGenerator()
		this.widgetFactory = new WidgetFactory()
	}

	public setFilterPattern(pattern: string | undefined) {
		this.filterPattern = pattern
		this.filterInput.setValue(pattern ?? '')
		this.clearFilterPatternButton.setText(buildPatternButtonText(pattern))
	}

	public setIsDebugging(isDebugging: boolean) {
		this.menu.setTextForItem(
			'toggleDebug',
			`Debug ^${isDebugging ? 'k' : 'w'}^#^${isDebugging ? 'g' : 'r'}${
				isDebugging ? ' • ' : ' • '
			}^`
		)
		this.isDebugging = isDebugging
	}

	public startCountdownTimer(durationSec: number) {
		clearInterval(this.countDownTimeInterval)
		this.countDownTimeInterval = undefined

		let remaining = durationSec

		this.setWatchLabel(`  ${remaining}  `)

		this.countDownTimeInterval = setInterval(() => {
			remaining--

			if (remaining < 0) {
				this.stopCountdownTimer()
			} else {
				this.setWatchLabel(`  ${remaining}  `)
			}
		}, 1000) as any
	}

	public stopCountdownTimer() {
		clearInterval(this.countDownTimeInterval)
		this.countDownTimeInterval = undefined
		this.setWatchMode(this.watchMode)
	}

	public setWatchMode(watchMode: WatchMode) {
		this.watchMode = watchMode
		if (!this.countDownTimeInterval) {
			let label = watchMode === 'smart' ? 'Smart Watch' : 'Standard Watch'
			if (watchMode === 'off') {
				label = 'Not Watching'
			}
			this.setWatchLabel(label)
		}
	}

	private setWatchLabel(label: string) {
		const isWatching = this.watchMode !== 'off'

		this.menu.setTextForItem(
			'watchDropdown',
			`${label} ^${isWatching ? 'k' : 'w'}^#^${isWatching ? 'g' : 'r'}${
				isWatching ? ' • ' : ' • '
			}^`
		)

		this.menu.setTextForItem(
			'toggleWatchAll',
			this.watchMode === 'all' ? '√ Standard' : 'Standard'
		)

		this.menu.setTextForItem(
			'toggleSmartWatch',
			this.watchMode === 'smart' ? '√ Smart' : 'Smart'
		)
	}

	public async start() {
		this.started = true

		this.window = this.widgetFactory.Widget('window', {})
		this.window.hideCursor()

		void this.window.on('key', this.handleGlobalKeypress.bind(this))
		void this.window.on('kill', this.destroy.bind(this))

		this.dropInTopLayout()
		this.dropInProgressBar()
		this.dropInMenu()
		this.dropInBottomLayout()
		this.dropInTestLog()
		this.dropInFilterControls()

		const frame = this.window.getFrame()

		if (frame.width > frame.height * 2) {
			this.orientation = 'landscape'
		} else {
			this.orientation = 'portrait'
		}

		this.setIsDebugging(this.isDebugging)
		this.setWatchMode(this.watchMode)
		this.setStatus(this.status)

		this.updateInterval = setInterval(
			this.handleUpdateInterval.bind(this),
			2000
		)
	}

	private dropInMenu() {
		this.menu = this.widgetFactory.Widget('menuBar', {
			parent: this.window,
			left: 0,
			top: 0,
			items: [
				{
					label: 'Restart    ',
					value: 'restart',
				},
				{
					label: 'Debug    ',
					value: 'toggleDebug',
				},
				{
					label: 'Not Watching   ',
					value: 'watchDropdown',
					items: [
						{
							label: 'Watch all',
							value: 'toggleWatchAll',
						},
						{
							label: 'Smart watch',
							value: 'toggleSmartWatch',
						},
					],
				},
				{
					label: 'Quit',
					value: 'quit',
				},
			],
		})

		void this.menu.on('select', this.handleMenuSelect.bind(this))
	}

	public setStatus(status: TestRunnerStatus) {
		this.status = status

		this.updateMenuLabels()
		if (status === 'ready') {
			this.bar.setLabel('Loading...')
		} else if (this.status === 'stopped') {
			this.refreshResults()
		}
	}

	private updateMenuLabels() {
		let restartLabel = 'Stopped ^#^r › ^'
		switch (this.status) {
			case 'running':
				restartLabel = 'Running ^k^#^g › ^'
				break
			case 'stopped':
				restartLabel = `${
					this.lastResults.totalTestFiles === 0 ? ' Start ' : 'Stopped'
				} ^w^#^r › ^`
				break
			case 'ready':
				restartLabel = 'Booting ^#^K › ^'
				break
		}

		this.menu.setTextForItem('restart', restartLabel)
	}

	private handleMenuSelect(payload: { value: string }) {
		switch (payload.value) {
			case 'quit':
				this.handleQuit?.()
				break
			case 'restart':
				this.handleStartStop?.()
				break
			case 'toggleDebug':
				this.handleToggleDebug?.()
				break
			case 'toggleWatchAll':
				this.handleToggleWatchAll?.()
				break
			case 'toggleSmartWatch':
				this.handleToggleSmartWatch?.()
				break
		}
	}

	private handleUpdateInterval() {
		if (this.status !== 'stopped') {
			this.refreshResults()
		}
	}

	private refreshResults() {
		if (this.lastResults) {
			this.updateLogs()
		}
	}

	private async handleGlobalKeypress(payload: { key: string }) {
		if (this.window.getFocusedWidget() === this.filterInput) {
			return
		}

		switch (payload.key) {
			case 'ENTER':
				this.handleRestart?.()
				break
			case 'CTRL_C':
				this.handleQuit?.()
				process.exit()
				break
		}
	}

	private dropInTestLog() {
		const parent = this.layout.getChildById('results')

		if (parent) {
			this.testLog = this.widgetFactory.Widget('text', {
				parent,
				isScrollEnabled: true,
				left: 0,
				top: 0,
				height: '100%',
				width: '100%',
				shouldLockHeightWithParent: true,
				shouldLockWidthWithParent: true,
			})

			void this.testLog.on('click', this.handleClickTestFile.bind(this))
		}
	}

	private async handleClickTestFile(payload: { row: number; column: number }) {
		const testFile = this.getFileForLine(payload.row)
		const { row, column } = payload

		this.closeSelectTestPopup()

		if (testFile) {
			this.dropInSelectTestPopup({ testFile, column, row })
		}
	}

	private closeSelectTestPopup() {
		if (this.selectTestPopup) {
			void this.selectTestPopup.destroy()
			this.selectTestPopup = undefined
		}
	}

	private dropInSelectTestPopup(options: {
		testFile: string
		column: number
		row: number
	}) {
		const { testFile, row, column } = options

		this.selectTestPopup = this.widgetFactory.Widget('popup', {
			parent: this.window,
			left: Math.max(1, column - 25),
			top: Math.max(4, row - 2),
			width: 50,
			height: 10,
		})

		this.widgetFactory.Widget('text', {
			parent: this.selectTestPopup,
			left: 1,
			top: 1,
			height: 4,
			width: this.selectTestPopup.getFrame().width - 2,
			text: `What do you wanna do with:\n\n${testFile}`,
		})

		const open = this.widgetFactory.Widget('button', {
			parent: this.selectTestPopup,
			left: 1,
			top: 6,
			text: 'Open',
		})

		const rerun = this.widgetFactory.Widget('button', {
			parent: this.selectTestPopup,
			left: 20,
			top: 6,
			text: 'Test',
		})

		const cancel = this.widgetFactory.Widget('button', {
			parent: this.selectTestPopup,
			left: 37,
			top: 6,
			text: 'Nevermind',
		})

		void rerun.on('click', () => {
			this.handleRerunTestFile?.(testFile)
			this.closeSelectTestPopup()
		})
		void cancel.on('click', this.closeSelectTestPopup.bind(this))
		void open.on('click', () => {
			this.openTestFile(testFile)
		})
	}

	private openTestFile(testFile: string) {
		this.handleOpenTestFile?.(testFile)
		this.closeSelectTestPopup()
	}

	public getFileForLine(row: number): string | undefined {
		let line = this.testLog.getScrollY()

		for (let file of this.lastResults.testFiles ?? []) {
			if (line === row) {
				return file.path
			}

			line++

			for (let c = 0; c < (file.tests ?? []).length; c++) {
				if (line === row) {
					return file.path
				}

				line++
			}
		}

		return undefined
	}

	private dropInProgressBar() {
		const parent = this.topLayout.getChildById('progress') ?? this.window
		this.bar = this.widgetFactory.Widget('progressBar', {
			parent,
			left: 0,
			top: 0,
			width: parent.getFrame().width,
			shouldLockWidthWithParent: true,
			label: 'Ready and waiting...',
			progress: 0,
		})
	}

	private dropInFilterControls() {
		const parent = this.topLayout.getChildById('filter') ?? this.window

		const buttonWidth = 3
		this.filterInput = this.widgetFactory.Widget('input', {
			parent,
			left: 0,
			label: 'Pattern',
			width: parent.getFrame().width - buttonWidth,
			height: 1,
			value: this.filterPattern,
		})

		void this.filterInput.on('cancel', () => {
			this.filterInput.setValue(this.filterPattern ?? '')
		})

		void this.filterInput.on('submit', (payload) => {
			this.handleFilterChange?.(payload.value ?? undefined)
		})

		this.clearFilterPatternButton = this.widgetFactory.Widget('button', {
			parent,
			left: this.filterInput.getFrame().width,
			width: buttonWidth,
			top: 0,
			text: buildPatternButtonText(this.filterPattern),
		})

		void this.clearFilterPatternButton.on('click', () => {
			if (this.filterPattern || this.filterPattern?.length === 0) {
				this.handleFilterChange?.(undefined)
			} else {
				this.filterInput.setValue('')
			}
		})
	}

	private dropInBottomLayout() {
		this.layout = this.widgetFactory.Widget('layout', {
			parent: this.window,
			width: '100%',
			top: 4,
			height: this.window.getFrame().height - 4,
			shouldLockWidthWithParent: true,
			shouldLockHeightWithParent: true,
			rows: [
				{
					height: '100%',
					columns: [
						{
							id: 'results',
							width: '100%',
						},
					],
				},
			],
		})
	}

	private dropInTopLayout() {
		this.topLayout = this.widgetFactory.Widget('layout', {
			parent: this.window,
			width: '100%',
			top: 1,
			height: 3,
			shouldLockWidthWithParent: true,
			shouldLockHeightWithParent: true,
			rows: [
				{
					height: '100%',
					columns: [
						{
							id: 'progress',
							width: 50,
						},
						{
							id: 'filter',
						},
					],
				},
			],
		})
	}

	public updateResults(results: SpruceTestResults) {
		if (!this.started) {
			throw new Error('You must call start() before anything else.')
		}

		this.lastResults = {
			...this.lastResults,
			...results,
		}

		this.updateProgressBar(results)

		const percentPassing = this.generatePercentPassing(results)
		const percentComplete = this.generatePercentComplete(results)

		this.window.setTitle(
			`Testing: ${percentComplete}% complete.${
				percentComplete > 0 ? ` ${percentPassing}% passing.` : ''
			}`
		)

		this.updateLogs()
	}

	private updateLogs() {
		if (this.selectTestPopup) {
			return
		}

		let { logContent, errorContent } = this.resultsToLogContents(
			this.lastResults
		)

		this.testLog.setText(logContent)

		if (!errorContent) {
			this.errorLog && this.destroyErrorLog()
		} else {
			!this.errorLog && this.dropInErrorLog()
			const cleanedLog = this.cwd
				? errorContent.replace(new RegExp(this.cwd + '/', 'gim'), '')
				: errorContent

			this.errorLog?.setText(cleanedLog)
		}
	}

	private resultsToLogContents(results: SpruceTestResults) {
		let logContent = ''
		let errorContent = ''

		results.testFiles?.forEach((file) => {
			logContent += this.errorLogItemGenerator.generateLogItemForFile(
				file,
				this.status
			)
			errorContent += this.errorLogItemGenerator.generateErrorLogItemForFile(
				file
			)
		})

		if (this.lastResults.customErrors.length > 0) {
			errorContent =
				this.lastResults.customErrors.map((err) => chalk.red(err)).join(`\n`) +
				`\n${errorContent}`
		}

		return { logContent, errorContent }
	}

	private dropInErrorLog() {
		if (this.layout.getRows().length === 1) {
			if (this.orientation === 'portrait') {
				this.layout.addRow({
					id: 'row_2',
					columns: [{ id: 'errors', width: '100%' }],
				})

				this.layout.setRowHeight(0, '50%')
			} else {
				this.layout.addColumn(0, { id: 'errors', width: '50%' })
				this.layout.setColumnWidth({ rowIdx: 0, columnIdx: 0, width: '50%' })
			}

			this.layout.updateLayout()

			const cell = this.layout.getChildById('errors')

			if (!cell) {
				throw new Error('Pulling child error')
			}

			this.errorLog = this.widgetFactory.Widget('text', {
				parent: cell,
				width: '100%',
				height: '100%',
				isScrollEnabled: true,
				shouldAutoScrollWhenAppendingContent: false,
				shouldLockHeightWithParent: true,
				shouldLockWidthWithParent: true,
				padding: { left: 1 },
			})
		}
	}

	private destroyErrorLog() {
		if (this.errorLog) {
			void this.errorLog?.destroy()
			this.errorLog = undefined

			if (this.orientation === 'landscape') {
				this.layout.removeColumn(0, 1)
				this.layout.setColumnWidth({ rowIdx: 0, columnIdx: 0, width: '100%' })
			} else {
				this.layout.removeRow(1)
				this.layout.setRowHeight(0, '100%')
			}
			this.layout.updateLayout()
		}
	}

	private updateProgressBar(results: SpruceTestResults) {
		if (results.totalTestFilesComplete ?? 0 > 0) {
			const testsRemaining =
				results.totalTestFiles - (results.totalTestFilesComplete ?? 0)

			if (testsRemaining === 0) {
				const {
					percent,
					totalTests,
					totalPassedTests,
					totalTime,
				} = this.generateProgressStats(results)

				this.bar.setLabel(
					`Finished! ${totalPassedTests} of ${totalTests} (${percent}%) passed in ${durationUtil.msToFriendly(
						totalTime
					)}.${percent < 100 ? ` Don't give up! 💪` : ''}`
				)
			} else {
				this.bar.setLabel(
					`${results.totalTestFilesComplete} of ${
						results.totalTestFiles
					} (${this.generatePercentComplete(
						results
					)}%) complete. ${testsRemaining} remaining...`
				)
			}
		} else {
			this.bar.setLabel('0%')
		}

		this.bar.setProgress(this.generatePercentComplete(results) / 100)
	}

	private generateProgressStats(
		results: SpruceTestResults
	): {
		percent: number
		totalTests: number
		totalPassedTests: number
		totalTime: number
	} {
		const percent = this.generatePercentPassing(results)
		const totalTests = this.getTotalTestsRun(results)
		const totalPassedTests = results.totalPassed ?? 0
		let totalTime = 0

		results.testFiles?.forEach((file) => {
			file.tests?.forEach((test) => {
				totalTime += test.duration
			})
		})

		return {
			percent,
			totalTests,
			totalPassedTests,
			totalTime,
		}
	}

	private generatePercentComplete(results: SpruceTestResults): number {
		const percent =
			(results.totalTestFilesComplete ?? 0) / results.totalTestFiles
		if (isNaN(percent)) {
			return 0
		}
		return Math.round(percent * 100)
	}

	private generatePercentPassing(results: SpruceTestResults): number {
		const percent = (results.totalPassed ?? 0) / this.getTotalTestsRun(results)

		if (isNaN(percent)) {
			return 0
		}

		return Math.floor(percent * 100)
	}

	private getTotalTestsRun(results: SpruceTestResults) {
		return (
			(results.totalTests ?? 0) -
			(results.totalSkipped ?? 0) -
			(results.totalTodo ?? 0)
		)
	}

	public render() {
		this.table?.computeCells()
		this.table?.draw()
	}

	public async destroy() {
		clearInterval(this.updateInterval)
		await this.window.destroy()
	}

	public reset() {
		this.testLog.setText('')
		this.lastResults = {
			totalTestFiles: 0,
			customErrors: [],
		}
		this.destroyErrorLog()
		this.errorLogItemGenerator.resetStartTimes()
	}

	public appendError(message: string) {
		this.lastResults.customErrors.push(message)
	}
}
function buildPatternButtonText(pattern: string | undefined): string {
	return pattern ? ' x ' : ' - '
}
