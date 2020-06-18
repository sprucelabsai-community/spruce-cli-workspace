import Schema, { ISchemaDefinition } from '@sprucelabs/schema'
import _ from 'lodash'
import { Feature, IFeatures } from '#spruce/autoloaders/features'
import FormComponent, { IFormOptions } from '../components/FormComponent'
import { INpmPackage } from '../features/AbstractFeature'
import log from '../singletons/log'
import AbstractService from './AbstractService'

interface IInstallFeature {
	feature: Feature
	options?: Record<string, any>
}

export interface IInstallFeatureOptions {
	features: IInstallFeature[]
	installFeatureDependencies?: boolean
}

export default class FeatureService extends AbstractService {
	public get cwd() {
		return this._cwd
	}

	public set cwd(newCwd: string) {
		if (newCwd) {
			this._cwd = newCwd
			if (this.features && newCwd) {
				Object.keys(this.features).forEach(f => {
					this.features[f as keyof IFeatures].cwd = newCwd
				})
			}
		}
	}

	public install = async (options: IInstallFeatureOptions) => {
		const { features, installFeatureDependencies = true } = options

		let featuresToInstall: IInstallFeature[] = []

		for (let i = 0; i < features.length; i += 1) {
			const f = features[i]
			const isInstalled = await this.features[f.feature].isInstalled()
			if (!isInstalled && installFeatureDependencies) {
				featuresToInstall = featuresToInstall.concat(
					this.getFeatureDependencies(f)
				)
			} else if (!isInstalled) {
				debugger
			} else {
				log.debug(
					`Feature prompts / dependencies skipped because it's already installed: ${f.feature}`
				)
			}
		}

		featuresToInstall = _.uniq(featuresToInstall)
		this.sortInstallFeatures(featuresToInstall)

		for (let i = 0; i < featuresToInstall.length; i += 1) {
			const f = featuresToInstall[i]
			const isInstalled = await this.features[f.feature].isInstalled()
			if (!isInstalled) {
				await this.installFeature(f)
			} else {
				log.debug(
					`Feature installation skipped because it's already installed: ${f.feature}`
				)
			}
		}
	}

	/** Check if features are installed */
	public isInstalled = async (options: {
		features: Feature[]
		cwd?: string
	}) => {
		const cwd = options.cwd ?? this.cwd
		const results = await Promise.all(
			options.features.map(f => {
				return this.features[f].isInstalled(cwd)
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

	public getFeatureDependencies = (
		installFeature: IInstallFeature,
		currentFeatures: IInstallFeature[] = []
	): IInstallFeature[] => {
		let features: IInstallFeature[] = [installFeature]

		currentFeatures.push(installFeature)

		for (
			let i = 0;
			i < this.features[installFeature.feature].featureDependencies.length;
			i += 1
		) {
			const featureDependency = this.features[installFeature.feature]
				.featureDependencies[i]

			const currentFeature = currentFeatures?.find(
				f => f.feature === featureDependency
			)

			if (!currentFeature) {
				features = this.getFeatureDependencies(
					{
						feature: featureDependency,
						options: installFeature.options
					},
					currentFeatures
				).concat(features)

				currentFeatures = currentFeatures.concat(features)
			}
		}

		this.sortInstallFeatures(features)
		return features
	}

	/** Gets available features */
	public getAvailableFeatures(): {
		feature: Feature
		description: string
	}[] {
		const availableFeatures = Object.values(Feature).map(f => {
			const description = this.features[f].description ?? f
			return {
				feature: f,
				description
			}
		})

		return availableFeatures
	}

	private async installFeature(installFeature: IInstallFeature): Promise<void> {
		const feature = this.features[installFeature.feature]
		this.term.info(`Beginning feature installation: ${installFeature.feature}`)
		let optionsSchema: ISchemaDefinition | undefined
		let isValid = false
		if (feature.optionsDefinition) {
			optionsSchema = feature.optionsDefinition
			isValid = Schema.isDefinitionValid(optionsSchema)
		}
		let answers: Record<string, any> = {}
		if (isValid && optionsSchema) {
			const schema = new Schema(optionsSchema)
			const fieldNames = schema.getNamedFields()

			for (let i = 0; i < fieldNames.length; i += 1) {
				const fieldName = fieldNames[i]
				if (installFeature.options && installFeature.options[fieldName.name]) {
					// We don't need to prompt for this. Add it to the answers
					answers[fieldName.name] = installFeature.options[fieldName.name]
					delete optionsSchema.fields?.[fieldName.name]
				}
			}

			// Only present prompts if we don't already have the data
			if (
				optionsSchema.fields &&
				Object.keys(optionsSchema.fields).length > 0
			) {
				const formBuilder = this.formBuilder({
					definition: optionsSchema
				})
				const formAnswers = await formBuilder.present()
				answers = {
					...answers,
					...formAnswers
				}
			}
		} else {
			log.debug(
				`Not prompting. Options schema is missing or invalid for: ${installFeature.feature}`
			)
		}

		this.term.startLoading(`[${installFeature.feature}]: Starting installation`)
		await feature.beforePackageInstall({
			// @ts-ignore
			answers
		})
		this.term.stopLoading()

		const packagesToInstall: string[] = []
		const devPackagesToInstall: string[] = []

		const packages: {
			[pkgName: string]: INpmPackage
		} = {}

		feature.packages.forEach(pkg => {
			const packageName = `${pkg.name}@${pkg.version ?? 'latest'}`
			packages[packageName] = pkg
		})

		Object.values(packages).forEach(p => {
			if (p.isDev) {
				devPackagesToInstall.push(p.name)
			} else {
				packagesToInstall.push(p.name)
			}
		})

		if (packagesToInstall.length > 0) {
			this.term.startLoading(
				`[${installFeature.feature}]: Installing package.json dependencies`
			)
			await this.services.pkg.install(packagesToInstall)
			this.term.stopLoading()
		}
		if (devPackagesToInstall.length > 0) {
			this.term.startLoading(
				`[${installFeature.feature}]: Installing package.json devDependencies`
			)
			await this.services.pkg.install(devPackagesToInstall, {
				dev: true
			})
			this.term.stopLoading()
		}

		this.term.startLoading(`[${installFeature.feature}]: Finishing up`)
		await feature.afterPackageInstall({
			// @ts-ignore
			answers
		})
		this.term.stopLoading()

		this.term.info(`Feature installation complete: ${installFeature.feature}`)
	}

	/** Sorts installation features for dependency order. Mutates the array. */
	private sortInstallFeatures(features: IInstallFeature[]): void {
		features.sort((a, b) => {
			const aFeature = this.features[a.feature]
			const bFeature = this.features[b.feature]

			const aDependsOnB = aFeature.featureDependencies.find(
				d => d === b.feature
			)
			const bDependsOnA = bFeature.featureDependencies.find(
				d => d === a.feature
			)

			if (aDependsOnB) {
				return 1
			} else if (bDependsOnA) {
				return -1
			}
			return 0
		})
	}

	private formBuilder<T extends ISchemaDefinition>(
		options: Omit<IFormOptions<T>, 'term'>
	): FormComponent<T> {
		const formBuilder = new FormComponent({
			term: this.utilities.terminal,
			...options
		})
		return formBuilder
	}
}
