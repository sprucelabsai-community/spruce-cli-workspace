export type TestResultStatus = 'running' | 'passed' | 'failed'
export interface SpruceTestFileTest {
	name: string
	status: 'passed' | 'failed' | 'skipped' | 'pending' | 'todo' | 'disabled'
	errorMessages?: string[]
	duration: number
}

export interface SpruceTestFile {
	path: string
	status: TestResultStatus
	tests?: SpruceTestFileTest[]
	errorMessage?: string
}

export interface SpruceTestResults {
	totalTests?: number
	totalPassed?: number
	totalFailed?: number
	totalSkipped?: number
	totalTodo?: number
	totalTestFiles: number
	totalTestFilesComplete?: number
	testFiles?: SpruceTestFile[]
}

export type TestRunnerStatus = 'running' | 'stopped' | 'ready'
