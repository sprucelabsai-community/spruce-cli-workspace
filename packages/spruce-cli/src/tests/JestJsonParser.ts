import JsonParser, {
	AssertionResult,
	END_DIVIDER,
	START_DIVIDER,
	retrocycle,
} from '@sprucelabs/jest-json-reporter'
import escapeRegExp from 'lodash/escapeRegExp'
import {
	SpruceTestFile,
	TestResultStatus,
	SpruceTestResults,
} from '../features/test/test.types'

export type JsonResultKeys = JsonParserResult['status']
interface OnTestFileResult {
	status: 'onTestFileResult'
	test: Parameters<JsonParser['onTestFileResult']>[0]
	testResult: Parameters<JsonParser['onTestFileResult']>[1]
	aggregatedResult: Parameters<JsonParser['onTestFileResult']>[2]
}

type JsonParserResult =
	| {
			status: 'onRunStart'
			results: Parameters<JsonParser['onRunStart']>[0]
	  }
	| {
			status: 'onTestCaseResult'
			test: Parameters<JsonParser['onTestCaseResult']>[0]
			testCaseResult: Parameters<JsonParser['onTestCaseResult']>[1]
	  }
	| {
			status: 'onTestFileStart'
			test: Parameters<JsonParser['onTestFileStart']>[0]
	  }
	| OnTestFileResult

export default class JestJsonParser {
	private testResults: SpruceTestResults = { totalTestFiles: 0 }
	private buffer = ''

	public write(data: string) {
		let dataToProcess = this.buffer + data
		let endDividerStartIdx = -1

		do {
			endDividerStartIdx = dataToProcess.search(escapeRegExp(END_DIVIDER))
			if (endDividerStartIdx > -1) {
				let startDividerIdx = Math.max(
					0,
					dataToProcess.search(escapeRegExp(START_DIVIDER))
				)
				let endDividerEndIdx = endDividerStartIdx + END_DIVIDER.length
				if (startDividerIdx > endDividerStartIdx) {
					startDividerIdx = -1
				}
				const firstSegment = dataToProcess.substr(
					startDividerIdx,
					endDividerEndIdx - startDividerIdx
				)
				const cleanedSegment = firstSegment
					.replace(START_DIVIDER, '')
					.replace(END_DIVIDER, '')
					.trim()

				const result = retrocycle(
					JSON.parse(cleanedSegment)
				) as JsonParserResult

				this.ingestJestResult(result)

				dataToProcess = dataToProcess.substr(endDividerEndIdx)
			}
		} while (endDividerStartIdx > -1)

		this.buffer = dataToProcess
	}

	private ingestJestResult(result: JsonParserResult) {
		const testFiles = this.testResults.testFiles ?? []
		switch (result.status) {
			case 'onRunStart':
				this.testResults = {
					totalTestFiles: result.results.numTotalTestSuites,
				}

				break

			case 'onTestCaseResult': {
				const relativePath = this.mapAbsoluteJsToRelativeTsPath(
					result.test.path
				)
				const idx = testFiles.findIndex((file) => file.path === relativePath)
				const test = this.testCaseResultToTest(result.testCaseResult)

				if (!testFiles[idx].tests) {
					testFiles[idx].tests = []
				}
				testFiles[idx].tests?.push(test)

				break
			}
			case 'onTestFileStart':
				testFiles.push({
					path: this.pullPathFromTestResponse(result),
					status: this.pullTestFileStatusFromTestResponse(result),
				})

				break

			case 'onTestFileResult': {
				this.testResults.totalTestFilesComplete =
					this.pullTestFilesCompleteFromAggregatedResults(
						result.aggregatedResult
					)
				this.testResults.totalTestFiles =
					result.aggregatedResult.numTotalTestSuites
				this.testResults.totalFailed = result.aggregatedResult.numFailedTests
				this.testResults.totalPassed = result.aggregatedResult.numPassedTests
				this.testResults.totalTests = result.aggregatedResult.numTotalTests
				this.testResults.totalSkipped = result.aggregatedResult.numPendingTests
				this.testResults.totalTodo = result.aggregatedResult.numTodoTests

				for (const testResult of result.aggregatedResult.testResults) {
					const relativePath = this.mapAbsoluteJsToRelativeTsPath(
						testResult.testFilePath
					)
					const idx = testFiles.findIndex((file) => file.path === relativePath)
					const file = {
						...(testFiles[idx] ?? {}),
						path: relativePath,
						status: this.pullTestFileResultStatus(testResult),
						tests: this.pullTestsFromTestFileResult(testResult),
					}

					if (testResult.failureMessage) {
						file.errorMessage = testResult.failureMessage
					}

					if (idx === -1) {
						testFiles.push(file)
					} else {
						testFiles[idx] = file
					}
				}

				break
			}
		}

		if (testFiles.length > 0) {
			this.testResults.testFiles = testFiles
		}
	}

	private pullTestFilesCompleteFromAggregatedResults(
		aggregatedResult: OnTestFileResult['aggregatedResult']
	) {
		const total =
			aggregatedResult.numFailedTestSuites +
			aggregatedResult.numPassedTestSuites

		return total
	}

	private pullPathFromTestResponse(result: JsonParserResult) {
		let path = ''

		switch (result.status) {
			case 'onTestFileResult':
			case 'onTestFileStart':
				path = result.test.path
				break
		}

		const tsFile = this.mapAbsoluteJsToRelativeTsPath(path)
		return tsFile
	}

	private mapAbsoluteJsToRelativeTsPath(path: string) {
		const partialPath = path.split('__tests__').pop()
		if (!partialPath) {
			throw new Error('INVALID TEST FILE')
		}
		const tsFile = partialPath.substr(1, partialPath.length - 3) + 'ts'
		return tsFile
	}

	private pullTestFileStatusFromTestResponse(
		result: JsonParserResult
	): SpruceTestFile['status'] {
		switch (result.status) {
			case 'onTestFileResult':
				return this.pullTestFileResultStatus(result.testResult)
			default:
				return 'running'
		}
	}

	private pullTestFileResultStatus(
		testResult: OnTestFileResult['testResult']
	): TestResultStatus {
		return testResult.failureMessage || testResult.numFailingTests > 0
			? 'failed'
			: 'passed'
	}

	private pullTestsFromTestFileResult(
		testResult: OnTestFileResult['testResult']
	): SpruceTestFile['tests'] {
		return testResult.testResults.map((test) =>
			//@ts-ignore - remove with next upgrade
			this.testCaseResultToTest(test)
		)
	}

	private testCaseResultToTest(test: AssertionResult): {
		name: string
		status: AssertionResult['status']
		errorMessages: string[]
		duration: number
	} {
		return {
			name: test.title,
			status: test.status,
			errorMessages: test.failureMessages,
			duration: test.duration ?? 0,
		}
	}

	public getResults(): SpruceTestResults {
		return this.testResults
	}
}
