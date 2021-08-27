import { test, assert } from '@sprucelabs/test'
import { random, uniq } from 'lodash'
import UpdateDependenciesAction from '../../features/node/actions/UpdateDependenciesAction'
import CommandService from '../../services/CommandService'
import AbstractCliTest from '../../tests/AbstractCliTest'
import { NpmPackage } from '../../types/cli.types'

export default class UpdateDependencies2Test extends AbstractCliTest {
	private static action: UpdateDependenciesAction

	protected static async beforeEach() {
		await super.beforeEach()
		this.action = this.Action('node', 'updateDependencies')
	}

	@test()
	protected static async runsAddForAllDependenciesInPkgJson() {
		const cacheKey = 'events'

		await this.FeatureFixture().installCachedFeatures(cacheKey)

		const name = await this.installRandomPackage()
		const devName = await this.installRandomDevPackage()
		const blocked = this.blockRandomPackages()

		const pkg = this.Service('pkg')
		const pkgJson = pkg.readPackage()
		const allDeps = [...(Object.keys(pkgJson.dependencies) ?? []), name]
		const allDevDeps = [
			...(Object.keys(pkgJson.devDependencies) ?? []),
			devName,
		]

		let passedArgs: any[] = []

		CommandService.setMockResponse(/(npm|yarn).*?install/, {
			code: 0,
			callback: (_, args) => {
				passedArgs.push(args)
			},
		})

		await this.action.execute({})

		const features = await this.getFeatureInstaller().getInstalledFeatures()

		for (const feature of features) {
			const featureDependencies = feature.packageDependencies as NpmPackage[]

			const deps = uniq(
				[
					...allDeps,
					...featureDependencies.filter((d) => !d.isDev).map((d) => d.name),
				]
					.map((n) => pkg.stripLatest(n))
					.filter((n) => n !== blocked)
			)

			const devDeps = uniq(
				[
					...allDevDeps,
					...featureDependencies.filter((d) => d.isDev).map((d) => d.name),
				]
					.map((n) => pkg.stripLatest(n))
					.filter((n) => n !== blocked)
			)

			for (const d of deps) {
				assert.doesInclude(passedArgs[0], d)
			}

			for (const d of devDeps) {
				assert.doesInclude(passedArgs[1], d)
			}
		}

		assert.doesNotInclude(passedArgs[0], blocked)
		assert.doesNotInclude(passedArgs[1], blocked)
	}

	protected static async installRandomPackage() {
		const names = ['moment', 'lodash']
		const name = names[random(0, names.length - 1)]
		const pkg = this.Service('pkg')
		await pkg.install(name)

		return name
	}

	protected static async installRandomDevPackage() {
		const names = ['moment', 'lodash']
		const name = names[random(0, names.length - 1)]
		const pkg = this.Service('pkg')
		await pkg.install(name, { isDev: true })

		return name
	}

	protected static blockRandomPackages() {
		const names = ['@sprucelabs/error', 'typescript']
		const name = names[random(0, names.length - 1)]

		this.action.blockUpgrade(name, this.Service('pkg'))
		this.action.blockUpgrade('random', this.Service('pkg'))

		return name
	}
}