import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../AbstractCliTest'
import FeatureCommandExecuter from '../../features/FeatureCommandExecuter'
import { FeatureCode } from '../../features/features.types'

export default class FeatureCommandExecuterTest extends AbstractCliTest {
	protected static async beforeEach() {
		super.beforeEach()
	}

	@test()
	protected static async canInstantiateExecuter() {
		const executer = this.Executer('schema', 'create')
		assert.isOk(executer)
	}

	@test()
	protected static async shouldAskAllQuestionsOfFeature() {
		const executer = this.Executer('skill', 'create')
		const promise = executer.execute()

		await this.wait(1000)

		await this.term.sendInput('My new skill')
		await this.term.sendInput('So great!')

		await promise

		await this.assertHealthySkillNamed('myNewSkill')
	}

	@test()
	protected static async shouldNotAskAlreadyAnsweredQuestions() {
		const executer = this.Executer('skill', 'create')
		const promise = executer.execute({ description: 'go team!' })

		await this.wait(1000)

		this.term.sendInput('My great skill')

		await promise

		await this.assertHealthySkillNamed('myGreatSkill')
	}

	private static async assertHealthySkillNamed(name: string) {
		const cli = await this.Cli()
		await this.linkLocalPackages()

		const health = await cli.checkHealth()

		assert.isEqualDeep(health, { skill: { status: 'passed' } })

		const packageContents = diskUtil.readFile(this.resolvePath('package.json'))
		assert.doesInclude(packageContents, name)
	}

	private static Executer<F extends FeatureCode>(
		featureCode: F,
		actionCode: string
	) {
		const featureInstaller = this.FeatureInstaller()

		const executer = new FeatureCommandExecuter({
			featureCode,
			actionCode,
			featureInstaller,
			term: this.term,
		})

		return executer
	}
}
