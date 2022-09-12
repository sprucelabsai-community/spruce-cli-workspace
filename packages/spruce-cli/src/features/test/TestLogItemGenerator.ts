import { StackCleaner } from '@sprucelabs/test-utils'
import chalk from 'chalk'
import durationUtil from '../../utilities/duration.utility'
import {
	SpruceTestFile,
	SpruceTestFileTest,
	TestRunnerStatus,
} from './test.types'

export default class TestLogItemGenerator {
	private startTimes: Record<string, number> = {}
	private testRunnerStatus!: TestRunnerStatus

	public generateLogItemForFile(
		file: SpruceTestFile,
		status: TestRunnerStatus
	): string {
		this.testRunnerStatus = status

		let logContent = ''
		const duration = this.calculateDurationInMsForFile(file)

		logContent += `${this.generateStatusBlock(file.status)}   ${file.path}${
			duration ? ` ${this.generateDuration(file.status, duration)}` : ''
		}\n`

		if (file.tests) {
			file.tests.forEach((test) => {
				const bullet = this.bulletBasedOnStatus(test.status)
				logContent += `              ${bullet} ^-${
					test.name
				}^ ${this.generateDuration(test.status, test.duration)}\n`
			})
		}

		if (file.status === 'running') {
			const pendingKey = `${file.path}-pending-${file.tests?.length ?? 0}`
			logContent += `                ^-${'Running next test... ⚡️⚡️⚡️'}^ ${this.generateDuration(
				'running',
				this.calculateDurationInMs(pendingKey)
			)}\n`
		}

		return logContent
	}

	private generateDuration(status: any, duration: number) {
		if (duration === 0) {
			return ''
		}
		const durationColor = this.colorBasedOnStatus(status)
		return `^${durationColor}(${durationUtil.msToFriendly(duration)})^`
	}

	private bulletBasedOnStatus(
		status: SpruceTestFileTest['status'] | 'running'
	) {
		let bullet = 'y'

		switch (status) {
			case 'running':
				bullet = '^g(running)^'
				break
			case 'passed':
				bullet = '^g√^'
				break
			case 'failed':
				bullet = '^rx^'
				break
			case 'pending':
			case 'skipped':
				bullet = '^y(skipped)^'
				break
			case 'todo':
				bullet = '^y(todo)^'
				break
			default:
				bullet = '??'
				break
		}

		return bullet
	}

	private calculateDurationInMsForFile(file: SpruceTestFile): number {
		if (file.status !== 'running' && file.tests) {
			return file.tests.reduce((time, test) => {
				time += test.duration
				return time
			}, 0)
		}

		const key = file.path
		return this.calculateDurationInMs(key)
	}

	private calculateDurationInMs(key: string) {
		if (!this.startTimes[key]) {
			this.startTimes[key] = new Date().getTime()
		}

		const delta = new Date().getTime() - this.startTimes[key]
		return delta
	}

	public generateErrorLogItemForFile(file: SpruceTestFile): string {
		let errorContent = ''

		file.tests?.forEach((test) => {
			test.errorMessages?.forEach((message) => {
				const cleaned = message ?? StackCleaner.clean(message)
				errorContent += ` ${chalk.red(file.path)}\n`
				errorContent += ` - ${chalk.red(test.name)}\n\n`
				errorContent += cleaned.replace(/\n+ {4}at/i, '\n\n\n   at') + '\n\n\n'
			})
		})

		if (!errorContent && file.errorMessage) {
			errorContent += `${chalk.red(file.path)}\n`
			errorContent += file.errorMessage + '\n\n\n'
		}

		return errorContent
	}

	public resetStartTimes() {
		this.startTimes = {}
	}

	private generateStatusBlock(status: SpruceTestFile['status']) {
		const bgColor = this.colorBasedOnStatus(status)

		let statusLabel = status as string
		let color = 'k'
		let padding = 10
		switch (status) {
			case 'passed':
				padding = 11
				color = 'w'
				break
			case 'failed':
				padding = 11
				color = 'w'
				break
		}

		if (status === 'running' && this.testRunnerStatus === 'stopped') {
			statusLabel = 'stopped'
			color = 'w'
		}

		return `^b^#^${bgColor}^${color}^+${this.centerStringWithSpaces(
			statusLabel,
			padding
		)}^`
	}

	private colorBasedOnStatus(status: SpruceTestFile['status']) {
		let color = 'y'

		switch (status) {
			case 'passed':
				color = 'g'
				break
			case 'failed':
				color = 'r'
				break
		}

		if (status === 'running' && this.testRunnerStatus === 'stopped') {
			color = 'b'
		}

		return color
	}

	private centerStringWithSpaces(text: string, numberOfSpaces: number) {
		text = text.trim()
		let l = text.length
		let w2 = Math.floor(numberOfSpaces / 2)
		let l2 = Math.floor(l / 2)
		let s = new Array(w2 - l2 + 1).join(' ')
		text = s + text + s
		if (text.length < numberOfSpaces) {
			text += new Array(numberOfSpaces - text.length + 1).join(' ')
		}
		return text
	}
}
