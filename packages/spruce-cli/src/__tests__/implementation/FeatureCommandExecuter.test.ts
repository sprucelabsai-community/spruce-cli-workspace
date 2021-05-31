import * as coreSchemas from '@sprucelabs/spruce-core-schemas'
import {
	diskUtil,
	HealthCheckResults,
	versionUtil,
} from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import featuresUtil from '../../features/feature.utilities'
import {
	FeatureActionResponse,
	FeatureCode,
	FeatureInstallResponse,
} from '../../features/features.types'
import AbstractSchemaTest from '../../tests/AbstractSchemaTest'
import testUtil from '../../tests/utilities/test.utility'

export default class FeatureCommandExecuterTest extends AbstractSchemaTest {
	@test()
	protected static async canInstantiateExecuter() {
		const executer = this.Action('schema', 'create')
		assert.isTruthy(executer)
	}

	@test()
	protected static async throwWhenExecutingWhenMissingDependenciens() {
		const err = await assert.doesThrowAsync(() =>
			this.Action('skill', 'create').execute({})
		)
		errorAssertUtil.assertError(err, 'EXECUTING_COMMAND_FAILED')
	}

	@test()
	protected static async shouldAskAllQuestionsOfFeature() {
		const executer = this.Action('skill', 'create')
		const promise = executer.execute({})

		await this.waitForInput()

		await this.ui.sendInput('My new skill')
		await this.ui.sendInput('So great!')

		await promise

		await this.assertHealthySkillNamed('my-new-skill')
	}

	@test()
	protected static async shouldEmitExecutionEvents() {
		const executer = this.Action('skill', 'create')

		let emittedWillEvent = false
		let willEventCommand = ''
		let emittedDidEvent = false
		let didEventCommand = ''
		let willExecuteHitCount = 0
		let didExecuteHitCount = 0

		const emitter = this.getEmitter()

		void emitter.on('feature.will-execute', (payload) => {
			emittedWillEvent = true
			willExecuteHitCount++
			willEventCommand = featuresUtil.generateCommand(
				payload.featureCode,
				payload.actionCode
			)
			return { results: {} }
		})

		void emitter.on('feature.did-execute', (payload) => {
			emittedDidEvent = true
			didExecuteHitCount++
			didEventCommand = featuresUtil.generateCommand(
				payload.featureCode,
				payload.actionCode
			)
			return {
				meta: {
					taco: 'bell',
				},
			}
		})

		assert.isFalse(emittedWillEvent)
		assert.isFalse(emittedDidEvent)
		assert.isEqual(willExecuteHitCount, 0)
		assert.isEqual(didExecuteHitCount, 0)

		const promise = executer.execute({})

		await this.waitForInput()

		await this.ui.sendInput('My new skill')
		await this.ui.sendInput('So great!')

		const results = await promise

		assert.isEqual(results.meta?.taco, 'bell')
		assert.isEqual(willEventCommand, 'create.skill')
		assert.isEqual(didEventCommand, 'create.skill')
		assert.isEqual(willExecuteHitCount, 1)
		assert.isEqual(didExecuteHitCount, 1)
	}

	@test()
	protected static async shouldNotAskAlreadyAnsweredQuestions() {
		const executer = this.Action('skill', 'create')
		const promise = executer.execute({ description: 'go team!' })

		await this.waitForInput()

		void this.ui.sendInput('Already answered skill')

		await promise

		await this.assertHealthySkillNamed('already-answered-skill')
	}

	@test()
	protected static async shouldAddListenerWithoutBreakingOnSkill() {
		await this.FeatureFixture().installCachedFeatures('schemas')

		const executer = this.Action('event', 'listen')
		const promise = executer.execute({})

		await this.waitForInput()

		await this.ui.sendInput('skill')
		await this.ui.sendInput('will-boot')

		const results = await promise
		const version = versionUtil.generateVersion().dirValue
		testUtil.assertFileByNameInGeneratedFiles(
			`will-boot.${version}.listener.ts`,
			results.files
		)
	}

	@test()
	protected static async shouldAskInstallDependentFeatures() {
		const executer = this.Action('schema', 'create')
		void executer.execute({})

		await this.waitForInput()

		this.ui.reset()
		const lastQuestion = this.ui.lastInvocation()

		assert.isEqual(lastQuestion.command, 'prompt')
		assert.doesInclude(
			lastQuestion.options.label,
			/install the skill feature/gi
		)
	}

	@test()
	protected static async shouldInstallDependentFeatures() {
		const executer = this.Action('schema', 'create')
		const promise = executer.execute({})

		await this.waitForInput()

		await this.ui.sendInput('yes')

		await this.ui.sendInput('Skill with 1 dependency')

		await this.ui.sendInput('A skill that is so good')

		await this.waitForInput()

		await this.ui.sendInput('\n')

		await this.ui.sendInput('Restaurant')

		await this.ui.sendInput('\n')

		await this.wait(100)

		const installer = this.getFeatureInstaller()
		let isInstalled = await installer.isInstalled('schema')

		assert.isFalse(isInstalled)

		await promise

		await this.assertHealthySkillNamed('skill-with-1-dependency', {
			skill: { status: 'passed' },
			schema: {
				status: 'passed',
				schemas: this.generateExpectedHealthSchemas([
					...Object.values(coreSchemas),
					{
						id: 'restaurant',
						name: 'Restaurant',
						namespace: 'SkillWith1Dependency',
						version: versionUtil.generateVersion().constValue,
					},
				]),
			},
		})

		isInstalled = await installer.isInstalled('schema')

		assert.isTrue(isInstalled)
	}

	@test()
	protected static async shouldInstallTwoDependentFeatures() {
		const executer = this.Action('error', 'create')
		const promise = executer.execute({})

		await this.waitForInput()

		await this.ui.sendInput('yes')

		await this.ui.sendInput('My skill with 2 dependent features')

		await this.ui.sendInput('A skill that is so good')

		await this.waitForInput()

		await this.ui.sendInput('\n')

		await this.waitForInput()

		await this.ui.sendInput('\n')

		await this.ui.sendInput('Test error')

		await this.ui.sendInput('\n')

		await promise

		await this.assertHealthySkillNamed('my-skill-with-2-dependent-features', {
			skill: { status: 'passed' },
			schema: {
				status: 'passed',
				schemas: [],
			},
			error: {
				errorSchemas: [{ name: 'Test error', id: 'testError' }],
				status: 'passed',
			},
		})

		const installer = this.getFeatureInstaller()
		const isInstalled = await installer.isInstalled('schema')

		assert.isTrue(isInstalled)
	}

	@test()
	protected static async shouldReturnProperSummary() {
		const executer = this.Action('skill', 'create')
		const results = await executer.execute({
			name: 'install summary test skill',
			description: 'go team!',
		})

		assert.isTruthy(results.files)
		assert.isTruthy(results.packagesInstalled)

		assert.isAbove(results.files.length, 0)
		assert.isAbove(results.packagesInstalled.length, 0)
	}

	@test()
	protected static async canSkipOptionalDependencies() {
		const { promise: actionPromise } =
			await this.startBuildingNewErrorUntilOptionalDependencies('skip')

		const results = await this.finishBuildingUpToNamingNewError(actionPromise)

		assert.isTruthy(results.files)
		assert.isFalsy(results.errors)

		const pluginsDir = this.resolveHashSprucePath('features')
		assert.isFalse(diskUtil.doesDirExist(pluginsDir))

		testUtil.assertFileByNameInGeneratedFiles(
			'myNewError.schema.ts',
			results.files
		)
	}

	private static async assertHealthySkillNamed(
		name: string,
		expectedHealth: HealthCheckResults = { skill: { status: 'passed' } },
		expectedInstalledSkills: FeatureCode[] = ['skill']
	) {
		const cli = await this.Cli()
		await this.linkLocalPackages()

		const health = await cli.checkHealth()

		// @ts-ignore
		if (health.schema?.schemas) {
			//@ts-ignore
			health.schema.schemas = this.sortSchemas(health.schema.schemas)
		}

		assert.isEqualDeep(health, expectedHealth)

		const packageContents = diskUtil.readFile(this.resolvePath('package.json'))
		assert.doesInclude(packageContents, name)

		const installer = this.getFeatureInstaller()

		for (const code of expectedInstalledSkills) {
			const isInstalled = await installer.isInstalled(code)
			assert.isTrue(isInstalled)
		}
	}

	private static async finishBuildingUpToNamingNewError(
		actionPromise: Promise<FeatureInstallResponse & FeatureActionResponse>
	) {
		await this.ui.sendInput('')

		await this.waitForInput()

		await this.ui.sendInput('')

		await this.waitForInput()

		await this.ui.sendInput('My new error')
		await this.ui.sendInput('')

		const results = await actionPromise
		return results
	}

	private static async startBuildingNewErrorUntilOptionalDependencies(
		skillFeatureAnswer: 'skip' | 'yes' | 'alwaysSkip'
	) {
		const executer = this.Action('error', 'create')
		const promise = executer.execute({})

		await this.waitForInput()

		const message =
			this.ui.invocations[this.ui.invocations.length - 2].options.message
		assert.isTruthy(message)

		assert.doesInclude(message, /2 required/gi)
		assert.doesInclude(message, /1 optional/gi)

		assert.doesInclude(this.ui.lastInvocation(), {
			command: 'prompt',
			options: {
				type: 'select',
				options: {
					choices: [
						{
							value: 'yes',
							label: 'Yes',
						},
						{
							value: 'skip',
							label: 'Skip',
						},
						{
							value: 'alwaysSkip',
							label: 'Always skip',
						},
					],
				},
			},
		})

		await this.ui.sendInput(skillFeatureAnswer)

		await this.ui.sendInput('y')

		await this.waitForInput()

		await this.ui.sendInput('My new module')
		await this.ui.sendInput('it is for testing')

		await this.waitForInput()

		return { promise }
	}

	@test()
	protected static async canPermanentlySkipOptionalDependencies() {
		const { promise: actionPromise } =
			await this.startBuildingNewErrorUntilOptionalDependencies('alwaysSkip')

		await this.finishBuildingUpToNamingNewError(actionPromise)

		const executer = this.Action('error', 'create')
		const promise = executer.execute({})

		await this.waitForInput()

		assert.doesNotInclude(this.ui.lastInvocation(), {
			command: 'prompt',
			options: {
				type: 'select',
			},
		})

		await this.ui.sendInput('My second error')
		await this.ui.sendInput('')

		const secondTimeResults = await promise

		assert.isTruthy(secondTimeResults.files)

		testUtil.assertFileByNameInGeneratedFiles(
			'myNewError.schema.ts',
			secondTimeResults.files
		)
	}
}
