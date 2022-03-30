import { test, assert } from '@sprucelabs/test'
import CommandService from '../../../services/CommandService'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingASkill5Test extends AbstractCliTest {
	@test()
	protected static async upgradeResetsEventCache() {
		await this.installSetListenerCacheAndBlockExecute()

		await assert.doesThrowAsync(() =>
			this.Action('node', 'upgrade').execute({})
		)

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

		CommandService.setMockResponse(new RegExp(/yarn/gis), {
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

		const emitter = this.getEmitter()

		let wasHit = false

		await emitter.on('feature.will-execute', (payload) => {
			if (payload.featureCode === 'schema' && payload.actionCode === 'sync') {
				wasHit = true
			}

			return {}
		})

		await this.Action('node', 'upgrade').execute({})

		assert.isTrue(wasHit === shouldCreateSchema)
	}

	@test()
	protected static async modulesMovedFromDevToProdDependenciesStayThere() {
		await this.FeatureFixture().installCachedFeatures('skills')

		await this.moveDependencyToProd('@sprucelabs/resolve-path-aliases')
		await this.moveDependencyToDev('@sprucelabs/error')

		let wasMovedBackToDev = false
		let wasMovedBackToProd = false

		CommandService.setMockResponse(new RegExp(/yarn/gis), {
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

		await this.Action('node', 'upgrade').execute({})

		assert.isFalse(wasMovedBackToDev, 'dependency moved back to dev')
		assert.isFalse(wasMovedBackToProd, 'dependency moved back to prod')
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

		const emitter = this.getEmitter()
		void emitter.on('feature.will-execute', () => {
			throw new Error('Stop!')
		})
	}

	private static Settings() {
		return this.Service('eventSettings')
	}
}
