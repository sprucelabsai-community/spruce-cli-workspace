import { validateSchemaValues } from '@sprucelabs/schema'
import { uniq } from 'lodash'
import merge from 'lodash/merge'
import SpruceError from '../errors/SpruceError'
import ServiceFactory, {
	Service,
	ServiceProvider,
	ServiceMap,
} from '../services/ServiceFactory'
import { InternalUpdateHandler, NpmPackage } from '../types/cli.types'
import AbstractFeature, { FeatureDependency } from './AbstractFeature'
import {
	InstallFeatureOptions,
	FeatureInstallResponse,
	FeatureCode,
	InstallFeature,
	FeatureMap,
} from './features.types'

export default class FeatureInstaller implements ServiceProvider {
	public cwd: string

	private featureMap: Partial<FeatureMap> = {}
	private serviceFactory: ServiceFactory
	private featuresMarkedAsSkippedThisRun: FeatureCode[] = []
	public static startInstallIntertainmentHandler?: (
		didUpdateHandler: (handler: (message: string) => void) => void
	) => void
	public static stopInstallIntertainmentHandler?: () => void
	private packagesToInstall: string[] = []
	private devPackagesToInstall: string[] = []
	private featuresToMarkAsInstalled: string[] = []
	private afterPackageInstalls: InstallFeature[] = []

	public constructor(cwd: string, serviceFactory: ServiceFactory) {
		this.cwd = cwd
		this.serviceFactory = serviceFactory
	}

	public async isInstalled(code: FeatureCode): Promise<boolean> {
		const feature = this.getFeature(code)
		if (feature.isInstalled) {
			return feature.isInstalled()
		}
		return this.Service('settings').isMarkedAsInstalled(code)
	}

	public markAsSkippedThisRun(code: FeatureCode) {
		if (!this.isMarkedAsSkipped(code)) {
			this.featuresMarkedAsSkippedThisRun.push(code)
		}
	}
	public markAsPermanentlySkipped(code: FeatureCode) {
		if (!this.isMarkedAsSkipped(code)) {
			this.Service('settings').markAsPermanentlySkipped(code)
		}
	}

	public isMarkedAsSkipped(code: FeatureCode) {
		return (
			this.featuresMarkedAsSkippedThisRun.indexOf(code) > -1 ||
			this.Service('settings').isMarkedAsPermanentlySkipped(code)
		)
	}

	public mapFeature<C extends FeatureCode>(code: C, feature: FeatureMap[C]) {
		this.featureMap[code] = feature
	}

	public getFeature<C extends FeatureCode>(code: C): FeatureMap[C] {
		const feature = this.featureMap[code]
		if (!feature) {
			throw new SpruceError({ code: 'INVALID_FEATURE_CODE', featureCode: code })
		}

		return feature as FeatureMap[C]
	}

	public async areInstalled(codes: FeatureCode[]) {
		const results = await Promise.all(
			codes.map((f) => {
				return this.isInstalled(f)
			})
		)

		for (let i = 0; i < results.length; i += 1) {
			const result = results[i]
			if (!result) {
				return false
			}
		}

		return true
	}

	public getFeatureDependencies<C extends FeatureCode>(
		featureCode: C,
		trackedFeatures: FeatureDependency[] = []
	): FeatureDependency[] {
		let deps = this.getFeatureDependenciesIncludingSelf(
			{ code: featureCode, isRequired: true },
			trackedFeatures
		).filter((f) => f.code !== featureCode)

		deps = this.sortFeatures(deps)

		return deps
	}

	private getFeatureDependenciesIncludingSelf(
		featureDependency: FeatureDependency,
		trackedFeatures: FeatureDependency[] = []
	): FeatureDependency[] {
		const features: FeatureDependency[] = []

		if (!this.isDependencyInTracker(trackedFeatures, featureDependency)) {
			features.push(featureDependency)
			trackedFeatures.push(featureDependency)
		}

		const feature = this.getFeature(featureDependency.code)
		const dependencies = feature.dependencies

		for (let i = 0; i < dependencies.length; i += 1) {
			const dependency = dependencies[i]
			if (!this.isDependencyInTracker(trackedFeatures, dependency)) {
				features.push(dependency)
				trackedFeatures.push(dependency)
			}
		}

		for (let x = 0; x < dependencies.length; x += 1) {
			const dependency = dependencies[x]
			let dependencyDependencies = this.getFeatureDependenciesIncludingSelf(
				dependency,
				trackedFeatures
			)
			if (!dependency.isRequired) {
				dependencyDependencies = dependencyDependencies.map((f) => ({
					...f,
					isRequired: false,
				}))
			}

			features.push(...dependencyDependencies)
		}

		return features
	}

	private isDependencyInTracker(
		trackedFeatures: FeatureDependency[],
		dependency: FeatureDependency
	) {
		return !!trackedFeatures.find((f) => f.code === dependency.code)
	}

	public async install(
		options: InstallFeatureOptions
	): Promise<FeatureInstallResponse> {
		let {
			features,
			installFeatureDependencies = true,
			didUpdateHandler,
		} = options

		const shouldAllowEntertainment = !!features.find((f) => f.code === 'skill')

		if (
			FeatureInstaller.startInstallIntertainmentHandler &&
			shouldAllowEntertainment
		) {
			FeatureInstaller.startInstallIntertainmentHandler(
				(handler: InternalUpdateHandler) => {
					didUpdateHandler = handler
				}
			)
		}

		let results: FeatureInstallResponse = {}

		let dependenciesToInstall: FeatureDependency[] = []

		for (let i = 0; i < features.length; i += 1) {
			const f = features[i]
			const code = f.code

			didUpdateHandler?.(`Checking if ${code} is installed...`)

			const isInstalled = await this.isInstalled(code)
			if (!isInstalled && installFeatureDependencies) {
				didUpdateHandler?.(`It is not, checking dependencies...`)
				dependenciesToInstall = dependenciesToInstall.concat(
					this.getFeatureDependenciesIncludingSelf({ code, isRequired: true })
				)
			} else if (!isInstalled) {
				dependenciesToInstall.push({ code, isRequired: true })
			}
		}

		dependenciesToInstall = uniq(dependenciesToInstall)
		dependenciesToInstall = this.sortFeatures(dependenciesToInstall)

		for (let i = 0; i < dependenciesToInstall.length; i += 1) {
			const { code, isRequired } = dependenciesToInstall[i]

			const isInstalled = await this.isInstalled(code)

			if (!isInstalled && isRequired) {
				const installOptions =
					//@ts-ignore
					options.features.find((f) => f.code === code)?.options

				const installFeature = {
					code: dependenciesToInstall[i].code,
					options: installOptions,
				} as InstallFeature

				didUpdateHandler?.(`Installing the ${installFeature.code} feature....`)

				const installResults = await this.installFeature(
					installFeature,
					didUpdateHandler
				)
				results = merge(results, installResults)
			}
		}

		const pendingResults = await this.installAllPending(didUpdateHandler)
		results = merge(results, pendingResults)

		if (
			FeatureInstaller.stopInstallIntertainmentHandler &&
			shouldAllowEntertainment
		) {
			FeatureInstaller.stopInstallIntertainmentHandler()
		}

		return results
	}

	private async installFeature(
		installFeature: InstallFeature,
		didUpdateHandler?: InternalUpdateHandler
	): Promise<FeatureInstallResponse> {
		const feature = this.getFeature(installFeature.code) as AbstractFeature

		if (feature.optionsSchema) {
			//@ts-ignore
			validateSchemaValues(feature.optionsSchema, installFeature.options ?? {})
		}

		didUpdateHandler?.(`Running before package install hook...`)
		const beforeInstallResults = await feature.beforePackageInstall(
			//@ts-ignore
			installFeature.options
		)

		if (beforeInstallResults.cwd) {
			this.cwd = beforeInstallResults.cwd
		}

		didUpdateHandler?.(`Installing package dependencies...`)
		const packagesInstalled = await this.queueInstallPackageDependenciesWithoutEntertainment(
			feature,
			didUpdateHandler
		)

		didUpdateHandler?.(`Running after package install hook...`)
		this.afterPackageInstalls.push(installFeature)

		if (!feature.isInstalled) {
			this.featuresToMarkAsInstalled.push(feature.code)
		}

		const files = [...(beforeInstallResults.files ?? [])]

		return {
			files: files ?? undefined,
			packagesInstalled,
		}
	}

	public async installPackageDependencies(
		feature: AbstractFeature,
		didUpdateHandler?: InternalUpdateHandler
	) {
		return this.installPackageDependenciesForFeatures(
			[feature],
			didUpdateHandler
		)
	}

	public async installPackageDependenciesForFeatures(
		features: AbstractFeature[],
		didUpdateHandler?: InternalUpdateHandler
	) {
		if (FeatureInstaller.startInstallIntertainmentHandler) {
			FeatureInstaller.startInstallIntertainmentHandler(
				(handler: InternalUpdateHandler) => {
					didUpdateHandler = handler
				}
			)
		}

		for (const feature of features) {
			await this.queueInstallPackageDependenciesWithoutEntertainment(
				feature,
				didUpdateHandler
			)
		}

		await this.installAllPending(didUpdateHandler)

		if (FeatureInstaller.stopInstallIntertainmentHandler) {
			FeatureInstaller.stopInstallIntertainmentHandler()
		}
	}

	private async installAllPending(
		didUpdateHandler?: InternalUpdateHandler
	): Promise<FeatureInstallResponse> {
		const pkgService = this.Service('pkg')

		didUpdateHandler?.(
			`Installing ${this.packagesToInstall.length} node module${
				this.packagesToInstall.length === 1 ? '' : 's'
			} using NPM. Please be patient.`
		)

		await pkgService.install(this.packagesToInstall, {})

		didUpdateHandler?.(
			`Now installing ${this.devPackagesToInstall.length} DEV node module${
				this.devPackagesToInstall.length === 1 ? '' : 's'
			} using NPM. Please be patient.`
		)

		await pkgService.install(this.devPackagesToInstall, {
			isDev: true,
		})

		this.packagesToInstall = []
		this.devPackagesToInstall = []

		const settings = this.Service('settings')

		for (const code of this.featuresToMarkAsInstalled) {
			settings.markAsInstalled(code)
		}

		this.featuresToMarkAsInstalled = []

		let results: FeatureInstallResponse = {}

		for (const installFeature of this.afterPackageInstalls) {
			const feature = this.getFeature(installFeature.code)
			const afterInstallResults = await feature.afterPackageInstall(
				//@ts-ignore
				installFeature.options
			)

			results = merge(results, afterInstallResults)
		}

		return results
	}

	private async queueInstallPackageDependenciesWithoutEntertainment(
		feature: AbstractFeature,
		didUpdateHandler?: InternalUpdateHandler
	) {
		const packagesInstalled: NpmPackage[] = []

		feature.packageDependencies?.forEach((pkg) => {
			const packageName = `${pkg.name}@${pkg.version ?? 'latest'}`

			packagesInstalled.push(pkg)

			didUpdateHandler?.(`Checking node dependency: ${pkg.name}`)

			if (pkg.isDev) {
				this.devPackagesToInstall.push(packageName)
			} else {
				this.packagesToInstall.push(packageName)
			}
		})

		if (this.packagesToInstall.length > 0) {
			didUpdateHandler?.(
				`Queueing install of ${this.packagesToInstall.length} node dependenc${
					this.packagesToInstall.length === 1
						? 'y.'
						: 'ies for ' + this.getFeatureNameAndDesc(feature) + '...'
				}.`
			)
		}

		if (this.devPackagesToInstall.length > 0) {
			didUpdateHandler?.(
				`Queueing install of ${
					this.devPackagesToInstall.length
				} DEV node dependenc${
					this.devPackagesToInstall.length === 1
						? 'y.'
						: 'ies for ' + this.getFeatureNameAndDesc(feature) + '. 🤘'
				}.`
			)
		}

		return packagesInstalled
	}

	private getFeatureNameAndDesc(feature: AbstractFeature) {
		return `${feature.nameReadable}${
			feature.description ? ' (' + feature.description + ')' : ''
		}`
	}

	private sortFeatures(
		featureDependencies: FeatureDependency[]
	): FeatureDependency[] {
		return [...featureDependencies].sort((a, b) => {
			const aFeature = this.getFeature(a.code)
			const bFeature = this.getFeature(b.code)

			const aDependsOnB = aFeature.dependencies.find((d) => d.code === b.code)
			const bDependsOnA = bFeature.dependencies.find((d) => d.code === a.code)

			if (
				aDependsOnB ||
				aFeature.installOrderWeight < bFeature.installOrderWeight
			) {
				return 1
			} else if (
				bDependsOnA ||
				aFeature.installOrderWeight > bFeature.installOrderWeight
			) {
				return -1
			}
			return 0
		})
	}

	public Service<S extends Service>(type: S, cwd?: string): ServiceMap[S] {
		return this.serviceFactory.Service(cwd ?? this.cwd, type)
	}

	public getOptionsForFeature(code: FeatureCode) {
		return this.getFeature(code).optionsSchema
	}

	public getAllCodes(): FeatureCode[] {
		const codes = Object.keys(this.featureMap) as FeatureCode[]
		return this.sortFeatures(
			codes.map((code) => ({ code, isRequired: true }))
		).map((dep) => dep.code)
	}

	public async getInstalledFeatures() {
		const installed = await Promise.all(
			this.getAllCodes()
				.map(async (code) => {
					const isInstalled = await this.isInstalled(code)
					if (isInstalled) {
						return this.getFeature(code)
					}

					return false
				})
				.filter((f) => !!f)
		)

		return installed as FeatureMap[keyof FeatureMap][]
	}
}
