import { Schema } from '@sprucelabs/schema'
import { test, assert } from '@sprucelabs/test-utils'
import ActionFactory from '../../../features/ActionFactory'
import { FeatureAction } from '../../../features/features.types'
import CommandService from '../../../services/CommandService'
import LintService from '../../../services/LintService'
import ServiceFactory from '../../../services/ServiceFactory'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingASkill5Test extends AbstractCliTest {
	public static invocationLog: string[] = []

	protected static async beforeEach() {
		await super.beforeEach()
		this.invocationLog = []
	}

	@test()
	protected static async upgradeResetsEventCache() {
		await this.installSetListenerCacheAndBlockExecute()

		await assert.doesThrowAsync(() => this.upgrade())

		const value = this.Settings().getListenerCache()
		assert.isFalsy(value)
	}

	@test()
	protected static async doesNotResetEventCacheWithOtherAction() {
		await this.installSetListenerCacheAndBlockExecute()

		await assert.doesThrowAsync(() => this.Action('schema', 'sync').execute({}))

		const value = this.Settings().getListenerCache()
		assert.isEqualDeep(value, { shouldBeDeleted: true })
	}

	@test('syncs schemas when schemas installed and schemas folder exists', true)
	@test(
		'does not syncs schemas when schemas installed but schemas folder does not exist',
		false
	)
	protected static async shouldSyncSchemasIfSchemasIsInstalledAndSchemaFolderExists(
		shouldCreateSchema: boolean
	) {
		await this.FeatureFixture().installCachedFeatures('schemas')

		CommandService.fakeCommand(new RegExp(/yarn/gis), {
			code: 0,
		})

		if (shouldCreateSchema) {
			await this.Action('schema', 'create').execute({
				nameReadable: 'Test schema!',
				namePascal: 'AnotherTest',
				nameCamel: 'anotherTest',
				description: 'this is so great!',
			})
		}

		const emitter = this.emitter

		let wasHit = false

		await emitter.on('feature.will-execute', (payload) => {
			if (payload.featureCode === 'schema' && payload.actionCode === 'sync') {
				wasHit = true
			}

			return {}
		})

		await this.upgrade()

		assert.isTrue(wasHit === shouldCreateSchema)
	}

	@test()
	protected static async modulesMovedFromDevToProdDependenciesStayThere() {
		await this.installSkillsBuild()

		await this.moveDependencyToProd('@sprucelabs/resolve-path-aliases')
		await this.moveDependencyToDev('@sprucelabs/error')

		let wasMovedBackToDev = false
		let wasMovedBackToProd = false

		CommandService.fakeCommand(new RegExp(/yarn/gis), {
			code: 0,
			callback: (_, args) => {
				if (
					args.indexOf('-D') > -1 &&
					args.indexOf('@sprucelabs/resolve-path-aliases') > -1
				) {
					wasMovedBackToDev = true
				} else if (
					args.indexOf('-D') === -1 &&
					args.indexOf('@sprucelabs/error') > -1
				) {
					wasMovedBackToProd = true
				}
			},
		})

		await this.upgrade()

		assert.isFalse(wasMovedBackToDev, 'dependency moved back to dev')
		assert.isFalse(wasMovedBackToProd, 'dependency moved back to prod')
	}

	@test.only('lint after upgrade')
	protected static async runsFixLintAfterUpgrade() {
		ActionFactory.setActionClass(
			'node',
			'updateDependencies',
			SpyUpdateDependenciesAction
		)

		ServiceFactory.setFactoryClass('lint', SpyLintService)

		CommandService.fakeCommand(/.*/gi, {
			code: 0,
			callback: (command, args) => {
				this.invocationLog.push([command, ...args].join(' '))
			},
		})

		await this.installSkillsBuild()
		await this.upgrade()

		assert.isEqualDeep(this.invocationLog, [
			'which code',
			'updateDependencies',
			'yarn fix.lint',
			'yarn clean.build',
			'yarn build.dev',
		])
	}

	private static async upgrade() {
		await this.Action('node', 'upgrade').execute({})
	}

	private static async installSkillsBuild() {
		await this.FeatureFixture().installCachedFeatures('skills')
	}

	private static async moveDependencyToDev(name: string) {
		const pkg = this.Service('pkg')
		await pkg.uninstall(name)
		await pkg.install(name, { isDev: true })
	}
	private static async moveDependencyToProd(name: string) {
		const pkg = this.Service('pkg')

		await pkg.uninstall(name)
		await pkg.install(name)
	}

	private static async installSetListenerCacheAndBlockExecute() {
		await this.FeatureFixture().installCachedFeatures('events')

		const settings = this.Settings()
		settings.setListenerCache({ shouldBeDeleted: true })

		const emitter = this.emitter
		void emitter.on('feature.will-execute', () => {
			throw new Error('Stop!')
		})
	}

	private static Settings() {
		return this.Service('eventSettings')
	}
}

class SpyUpdateDependenciesAction implements FeatureAction {
	public optionsSchema?: Schema | undefined
	public commandAliases: string[] = []
	public invocationMessage: string = 'Nothing'
	public async execute() {
		UpgradingASkill5Test.invocationLog.push('updateDependencies')
		return {}
	}
}

class SpyLintService extends LintService {
	public static fixPattern: string
	public fix = async (pattern: string): Promise<string[]> => {
		SpyLintService.fixPattern = pattern
		UpgradingASkill5Test.invocationLog.push('fixLint')
		return []
	}
}
