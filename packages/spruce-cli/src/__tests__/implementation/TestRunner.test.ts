import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { CliInterface } from '../../cli'
import { SpruceTestResults } from '../../features/test/test.types'
import TestRunner from '../../features/test/TestRunner'
import AbstractTestTest from '../../tests/AbstractTestTest'
import AbstractWriter from '../../writers/AbstractWriter'

export default class TestRunnerTest extends AbstractTestTest {
	protected static testRunner: TestRunner

	protected static async beforeEach() {
		await super.beforeEach()
		this.testRunner = new TestRunner({
			cwd: this.cwd,
			commandService: this.Service('command'),
		})

		AbstractWriter.enableLinting()
	}

	@test()
	protected static async canCreateTestRunner() {
		assert.isTruthy(this.testRunner)
	}

	@test()
	protected static async runningOnDirWithNoTestsConfiguredThrows() {
		const err = await assert.doesThrowAsync(() => this.testRunner.run())
		errorAssertUtil.assertError(err, 'INVALID_TEST_DIRECTORY', {
			dir: this.cwd,
		})
	}

	@test()
	protected static async getsFailedResultsWhenTestFails() {
		const cli = await this.installTests()

		await this.createTest({ cli, name: 'Can book appointment' })

		let results = await this.testRunner.run()

		assert.isEqual(results.totalTestFiles, 1)
		assert.isEqual(results.totalFailed, 1)
		assert.isEqual(results.totalTests, 2)

		await this.createTest({ cli, name: 'Can cancel appointment' })

		results = await this.testRunner.run()

		assert.isEqual(results.totalTestFiles, 2)
		assert.isEqual(results.totalFailed, 2)
		assert.isEqual(results.totalTests, 4)
	}

	@test()
	protected static async passesOnGoodTests() {
		const cli = await this.installTests()

		await this.createTest({ cli, name: 'Can pass tests', shouldFix: true })

		const testResults = await this.testRunner.run()

		assert.isEqual(testResults.totalTestFiles, 1)
		assert.isEqual(testResults.totalFailed, 0)
		assert.isEqual(testResults.totalPassed, 2)
		assert.isEqual(testResults.totalTests, 2)
	}

	@test()
	protected static async emitsEventsOnTestUpdates() {
		const cli = await this.installTests()

		let results: SpruceTestResults | undefined
		await this.testRunner.on('did-update', (payload) => {
			results = payload.results
		})

		await this.createTest({ cli, name: 'Emitting test' })

		await this.testRunner.run()

		assert.isTruthy(results)
		assert.isEqual(results.totalTestFiles, 1)
		assert.isEqual(results.totalFailed, 1)
		assert.isEqual(results.totalTests, 2)
	}

	@test()
	protected static async canHandlePattern() {
		const cli = await this.installTests()

		await this.createTest({
			cli,
			name: 'Can handlePatterns tests',
			shouldBuild: false,
		})
		await this.createTest({ cli, name: 'Can handlePatterns2 tests' })

		const results = await this.testRunner.run({
			pattern: 'canHandlePatternsTests',
		})

		assert.isTruthy(results)
		assert.isEqual(results.totalTestFiles, 1)
		assert.isEqual(results.totalFailed, 1)
		assert.isEqual(results.totalTests, 2)
	}

	@test()
	protected static async testsCanBeKilled() {
		const cli = await this.installTests()

		await this.createTest({
			cli,
			name: 'Can handlePatterns tests',
			shouldBuild: false,
		})
		await this.createTest({ cli, name: 'Can handlePatterns2 tests' })

		const promise = this.testRunner.run({
			pattern: 'canHandlePatternsTests',
		})

		this.testRunner.kill()

		const results = await promise

		assert.isTrue(results.wasKilled)
	}

	private static async createTest(options: {
		cli: CliInterface
		name: string
		shouldFix?: boolean
		shouldBuild?: boolean
	}) {
		const { cli, name, shouldFix = false, shouldBuild = true } = options

		const results = await cli
			.getFeature('test')
			.Action('create')
			.execute({
				type: 'behavioral',
				nameReadable: name,
				nameCamel: namesUtil.toCamel(name),
				namePascal: namesUtil.toPascal(name),
			})

		if (shouldFix) {
			const file = results.files?.[0]
			assert.isTruthy(file)
			this.fixBadTest(file.path)
		}

		if (shouldBuild) {
			await this.Service('build').build()
		}

		return results
	}
}
