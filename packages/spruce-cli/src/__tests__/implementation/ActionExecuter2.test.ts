import { diskUtil, versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import featuresUtil from '../../features/feature.utilities'
import {
	FeatureActionResponse,
	FeatureInstallResponse,
} from '../../features/features.types'
import CommandService from '../../services/CommandService'
import AbstractSchemaTest from '../../tests/AbstractSchemaTest'
import testUtil from '../../tests/utilities/test.utility'

export default class FeatureCommandExecuterContTest extends AbstractSchemaTest {
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

	@test()
	protected static async shouldEmitExecutionEvents() {
		this.setupMockCommands()

		const executer = this.Action('skill', 'create', {
			shouldAutoHandleDependencies: true,
		})

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
			return {}
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
	protected static async canPermanentlySkipOptionalDependencies() {
		const { promise: actionPromise } =
			await this.startBuildingNewErrorUntilOptionalDependencies('alwaysSkip')

		await this.finishBuildingUpToNamingNewError(actionPromise)

		const executer = this.Action('error', 'create', {
			shouldAutoHandleDependencies: true,
		})
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

	@test()
	protected static async shouldReturnProperSummary() {
		this.setupMockCommands()

		const executer = this.Action('skill', 'create', {
			shouldAutoHandleDependencies: true,
		})
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
	protected static async shouldAskInstallDependentFeatures() {
		this.setupMockCommands()

		const executer = this.Action('schema', 'create', {
			shouldAutoHandleDependencies: true,
		})
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
	protected static async shouldAddListenerWithoutBreakingOnSkill() {
		this.setupMockCommands()

		await this.FeatureFixture().installCachedFeatures('schemas')

		const executer = this.Action('event', 'listen', {
			shouldAutoHandleDependencies: true,
		})
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
		const executer = this.Action('error', 'create', {
			shouldAutoHandleDependencies: true,
		})
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

	private static setupMockCommands() {
		CommandService.setMockResponse(new RegExp(/npm.*?install .*?/gis), {
			code: 0,
		})
	}
}
