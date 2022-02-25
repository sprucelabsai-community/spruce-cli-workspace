import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import findProcess from 'find-process'
import TestAction from '../../features/conversation/actions/TestAction'
import AbstractCliTest from '../../tests/AbstractCliTest'
import testUtil from '../../tests/utilities/test.utility'

export default class TestingAConversationTest extends AbstractCliTest {
	@test()
	protected static async hasTestConvoFeature() {
		assert.isFunction(this.Action('conversation', 'test').execute)
	}

	@test()
	protected static async shouldRunWithoutConversationShouldShutdownOnItsOwn() {
		await this.FeatureFixture().installCachedFeatures('conversation')

		const test = await this.Action('conversation', 'test').execute({
			shouldReturnImmediately: true,
			shouldRunSilently: true,
		})

		assert.isTruthy(test.meta)
		assert.isFunction(test.meta.kill)
		assert.isNumber(test.meta.pid)
		assert.isTruthy(test.meta.promise)

		let psResults

		do {
			psResults = await findProcess('pid', test.meta.pid)
		} while (psResults.length > 0)
	}

	@test()
	protected static async runsUntilKilled() {
		await this.installAndCreateConversation()

		const test = await this.Action('conversation', 'test').execute({
			shouldReturnImmediately: true,
			shouldRunSilently: true,
		})

		assert.isTruthy(test.meta)
		assert.isFunction(test.meta.kill)
		assert.isNumber(test.meta.pid)
		assert.isTruthy(test.meta.promise)

		await this.wait(1000)

		let psResults = await findProcess('pid', test.meta.pid)
		assert.isAbove(psResults.length, 0)

		await test.meta.kill()

		do {
			psResults = await findProcess('pid', test.meta.pid)
		} while (psResults.length > 0)
	}

	// @test.skip('No longer dies on stderr')
	// protected static async diesWithStandardError() {
	// 	const { conversation } = await this.installAndCreateConversation()

	// 	const topicFile = this.resolvePath(
	// 		'src',
	// 		'conversations',
	// 		'knockKnockJoke.topic.ts'
	// 	)

	// 	const contents =
	// 		`process.stderr.write('oh no!')\n\n` + diskUtil.readFile(topicFile)

	// 	diskUtil.writeFile(topicFile, contents)

	// 	const test = await conversation
	// 		.Action('test')
	// 		.execute({ shouldRunSilently: true })

	// 	assert.isTruthy(test.errors)
	// 	errorAssert.assertError(test.errors[0], 'EXECUTING_COMMAND_FAILED', {
	// 		stderr: 'oh no!',
	// 	})
	// }

	private static async installAndCreateConversation() {
		await this.FeatureFixture().installCachedFeatures('conversation')

		const results = await this.Action('conversation', 'create').execute({
			nameReadable: 'tell a knock knock joke',
			nameCamel: 'knockKnockJoke',
		})

		assert.isFalsy(results.errors)
		return { createResults: results }
	}

	@test()
	protected static async doesntReturnErrorWhenKilled() {
		await this.installAndCreateConversation()
		//@ts-ignore
		const test = this.Action('conversation', 'test').getChild() as TestAction

		setTimeout(async () => {
			await test.kill()
		}, 5000)

		const results = await test.execute({
			shouldRunSilently: true,
		})

		assert.isFalsy(results.errors)
	}

	@test()
	protected static async returnsErrorWhenScriptErrors() {
		const { createResults } = await this.installAndCreateConversation()

		const topic = testUtil.assertFileByNameInGeneratedFiles(
			'knockKnockJoke',
			createResults.files
		)

		diskUtil.writeFile(topic, 'throw new Error("whaaa")')

		const test = this.Action('conversation', 'test')

		const results = await test.execute({
			shouldRunSilently: true,
		})

		assert.isArray(results.errors)
	}
}
