import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractSchemaTest from '../../tests/AbstractSchemaTest'

export default class FeatureCommandExecuterTest extends AbstractSchemaTest {
	@test()
	protected static async canInstantiateExecuter() {
		const executer = this.Action('schema', 'create', {
			shouldAutoHandleDependencies: true,
		})
		assert.isTruthy(executer)
	}

	@test()
	protected static async throwWhenExecutingWhenMissingDependencies() {
		const err = await assert.doesThrowAsync(() =>
			this.Action('skill', 'create').execute({})
		)
		errorAssertUtil.assertError(err, 'FEATURE_NOT_INSTALLED')
	}

	@test()
	protected static async shouldAskAllQuestionsOfFeature() {
		const executer = this.Action('skill', 'create', {
			shouldAutoHandleDependencies: true,
		})
		const promise = executer.execute({})

		await this.waitForInput()

		await this.ui.sendInput('My new skill')
		await this.ui.sendInput('So great!')

		await promise

		await this.assertHealthySkillNamed('my-new-skill')
	}

	@test()
	protected static async shouldNotAskAlreadyAnsweredQuestions() {
		const executer = this.Action('skill', 'create', {
			shouldAutoHandleDependencies: true,
		})
		const promise = executer.execute({ description: 'go team!' })

		await this.waitForInput()

		void this.ui.sendInput('Already answered skill')

		await promise

		await this.assertHealthySkillNamed('already-answered-skill')
	}
}
