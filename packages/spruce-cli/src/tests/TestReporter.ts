import { SpruceTestResults } from '../features/test/test.types'
import { Key } from '../widgets/keySelectChoices'
import { ButtonWidget } from '../widgets/types/button.types'
import { InputWidget } from '../widgets/types/input.types'
import { LayoutWidget } from '../widgets/types/layout.types'
import { MenuBarWidget } from '../widgets/types/menuBar.types'
import { PopupWidget } from '../widgets/types/popup.types'
import { ProgressBarWidget } from '../widgets/types/progressBar.types'
import { TextWidget } from '../widgets/types/text.types'
import { WindowWidget } from '../widgets/types/window.types'
import WidgetFactory from '../widgets/WidgetFactory'
import TestLogItemGenerator from './TestLogItemGenerator'

interface TestReporterOptions {
	onRestart?: () => void
	onQuit?: () => void
	onRequestOpenTestFile?: () => void
	handleRerunTestFile?: (fileName: string) => void
	handleOpenTestFile?: (fileName: string) => void
	handleFilterPatternChange?: (pattern?: string) => void
	handleToggleDebug: () => void
	filterPattern?: string
}

export default class TestReporter {
	private started = false
	private table?: any
	private bar!: ProgressBarWidget
	private layout!: LayoutWidget
	private testLog!: TextWidget
	private errorLog?: TextWidget
	private errorLogItemGenerator: TestLogItemGenerator
	private lastResults?: SpruceTestResults
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

	private onRestart?: () => void
	private onQuit?: () => void
	private handleRerunTestFile?: (fileName: string) => void
	private handleFilterChange?: (pattern?: string) => void
	private waitForDoneResolver?: () => void
	private handleOpenTestFile?: (testFile: string) => void
	private handleToggleDebug?: () => void

	public constructor(options?: TestReporterOptions) {
		this.filterPattern = options?.filterPattern
		this.onRestart = options?.onRestart
		this.onQuit = options?.onQuit
		this.handleRerunTestFile = options?.handleRerunTestFile
		this.handleOpenTestFile = options?.handleOpenTestFile
		this.handleFilterChange = options?.handleFilterPatternChange
		this.handleToggleDebug = options?.handleToggleDebug

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
			isDebugging ? 'Turn off debug' : 'Start debuging'
		)
		this.isDebugging = isDebugging
	}

	public async start() {
		this.started = true

		this.window = this.widgetFactory.Widget('window', {})
		this.window.hideCursor()

		void this.window.on('key', this.handleGlobalKeypress.bind(this))
		void this.window.on('kill', this.destroy.bind(this))

		this.dropInMenu()
		this.dropInTopLayout()
		this.dropInProgressBar()
		this.dropInBottomLayout()
		this.dropInTestLog()
		this.dropInFilterControls()

		this.updateInterval = setInterval(this.refreshResults.bind(this), 2000)
	}

	private dropInMenu() {
		this.menu = this.widgetFactory.Widget('menuBar', {
			parent: this.window,
			left: 0,
			top: 0,
			items: [
				{
					label: 'Quit',
					value: 'quit',
				},
				{
					label: 'Restart',
					value: 'restart',
				},
				{
					label: 'Enable debug',
					value: 'toggleDebug',
				},
			],
		})

		void this.menu.on('select', this.handleMenuSelect.bind(this))

		this.setIsDebugging(this.isDebugging)
	}

	private handleMenuSelect(payload: { value: string }) {
		switch (payload.value) {
			case 'quit':
				this.handleDone()
				break
			case 'restart':
				this.handleRestart()
				break
			case 'toggleDebug':
				this.handleToggleDebug?.()
				break
		}
	}

	private refreshResults() {
		if (this.lastResults) {
			this.updateLogs(this.lastResults)
		}
	}

	private async handleGlobalKeypress(payload: { key: Key }) {
		switch (payload.key) {
			case 'CTRL_C':
				this.onQuit?.()
				process.exit()
				break
		}
	}

	private dropInTestLog() {
		const parent = this.layout.getChildById('results')

		if (parent) {
			this.testLog = this.widgetFactory.Widget('text', {
				parent,
				enableScroll: true,
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
			text: 'Rerun',
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

		for (let file of this.lastResults?.testFiles ?? []) {
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
			label: 'Booting Jest...',
			progress: 0,
		})
	}

	private dropInFilterControls() {
		const parent = this.topLayout.getChildById('filter') ?? this.window

		const buttonWidth = 1
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
							width: 45,
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

		this.lastResults = results

		this.updateProgressBar(results)

		const percentPassing = this.generatePercentPassing(results)
		const percentComplete = this.generatePercentComplete(results)

		this.window.setTitle(
			`Testing: ${percentComplete}% complete.${
				percentComplete > 0 ? ` ${percentPassing}% passing.` : ''
			}`
		)

		this.updateLogs(results)
	}

	private updateLogs(results: SpruceTestResults) {
		if (this.selectTestPopup) {
			return
		}

		let { logContent, errorContent } = this.resultsToLogContents(results)

		this.testLog.setText(logContent)

		if (this.errorLog) {
			this.errorLog?.setText(errorContent)
		}
	}

	private resultsToLogContents(results: SpruceTestResults) {
		let logContent = ''
		let errorContent = ''

		results.testFiles?.forEach((file) => {
			logContent += this.errorLogItemGenerator.generateLogItemForFile(file)
			errorContent += this.errorLogItemGenerator.generateErrorLogItemForFile(
				file
			)

			if (errorContent.length > 0) {
				this.dropInErrorLog()
			}
		})

		return { logContent, errorContent }
	}

	private dropInErrorLog() {
		if (this.layout.getRows().length === 1) {
			this.layout.addRow({
				id: 'row_2',
				columns: [{ id: 'errors', width: '100%' }],
			})

			this.layout.setRowHeight(0, '50%')
			this.layout.updateLayout()

			const cell = this.layout.getChildById('errors')

			if (!cell) {
				throw new Error('Pulling child error')
			}

			this.errorLog = this.widgetFactory.Widget('text', {
				parent: cell,
				width: '100%',
				height: '100%',
				enableScroll: true,
				shouldLockHeightWithParent: true,
				shouldLockWidthWithParent: true,
				padding: { left: 1 },
			})
		}
	}

	private updateProgressBar(results: SpruceTestResults) {
		if (results.totalTestFilesComplete ?? 0 > 0) {
			const testsRemaining =
				results.totalTestFiles - (results.totalTestFilesComplete ?? 0)

			if (testsRemaining === 0) {
				const percent = this.generatePercentPassing(results)
				this.bar.setLabel(
					`Finished! ${percent}% passing.${
						percent < 100 ? ` Don't give up! 💪` : ''
					}`
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

	private generatePercentComplete(results: SpruceTestResults): number {
		const percent =
			(results.totalTestFilesComplete ?? 0) / results.totalTestFiles
		if (isNaN(percent)) {
			return 0
		}
		return Math.round(percent * 100)
	}

	private generatePercentPassing(results: SpruceTestResults): number {
		const percent =
			(results.totalPassed ?? 0) /
			((results.totalTests ?? 0) -
				(results.totalSkipped ?? 0) -
				(results.totalTodo ?? 0))
		if (isNaN(percent)) {
			return 0
		}

		return Math.round(percent * 100)
	}

	public render() {
		this.table?.computeCells()
		this.table?.draw()
	}

	public async waitForConfirm() {
		return new Promise((resolve: (_?: any) => void) => {
			this.waitForDoneResolver = resolve
			void this.window.on('key', (payload) => {
				if (payload.key === 'ENTER') {
					this.handleDone()
				}
			})
		})
	}

	private handleDone() {
		if (this.waitForDoneResolver) {
			this.waitForDoneResolver()
		} else {
			this.onQuit?.()
		}
	}

	private handleRestart() {
		this.onRestart?.()

		if (this.waitForDoneResolver) {
			this.waitForDoneResolver()
		}
	}

	public async destroy() {
		clearInterval(this.updateInterval)
		await this.window.destroy()
	}
}
function buildPatternButtonText(pattern: string | undefined): string {
	return pattern ? 'x' : '-'
}
