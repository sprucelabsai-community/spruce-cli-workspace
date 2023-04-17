import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import AbstractTestTest from '../../../tests/AbstractTestTest'

export default class RunningTestsTest extends AbstractTestTest {
	private static hasCreatedTest: any

	protected static async beforeEach(): Promise<void> {
		await super.beforeEach()
		this.hasCreatedTest = false
	}

	@test()
	protected static async hasTestAction() {
		await this.Cli()
		assert.isFunction(this.Action('test', 'test').execute)
	}

	@test()
	protected static async runningTestsActuallyRunsTests() {
		await this.installTests()

		const creationResults = await this.createTest({
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
			namePascal: 'CanBookAppointment',
		})

		const file = creationResults.files?.[0]
		assert.isTruthy(file)

		this.fixBadTest(file.path)

		await this.createTest({
			nameReadable: 'Can cancel appointment',
			nameCamel: 'canCancelAppointment',
			namePascal: 'CanCancelAppointment',
		})

		await this.Service('build').build()

		const results = await this.Action('test', 'test').execute({
			shouldReportWhileRunning: false,
		})

		assert.isTruthy(results.errors)
		assert.isLength(results.errors, 1)

		errorAssert.assertError(results.errors[0], 'TEST_FAILED')

		assert.isTruthy(results.meta)
		assert.isTruthy(results.meta?.testResults)

		assert.doesInclude(results.meta?.testResults, {
			wasKilled: false,
			totalTestFiles: 2,
			totalTestFilesComplete: 2,
			totalFailed: 1,
			totalPassed: 3,
			totalSkipped: 0,
			totalTests: 4,
			totalTodo: 0,
		})
	}

	private static async createTest(options: {
		nameReadable: string
		nameCamel: string
		namePascal: string
	}) {
		const creationPromise = this.Action('test', 'create').execute({
			type: 'behavioral',
			...options,
		})

		if (this.hasCreatedTest) {
			await this.waitForInput()
			await this.ui.sendInput({ path: '.' })
		}

		this.hasCreatedTest = true

		await this.waitForInput()
		await this.ui.sendInput('')

		const creationResults = await creationPromise
		return creationResults
	}
}
