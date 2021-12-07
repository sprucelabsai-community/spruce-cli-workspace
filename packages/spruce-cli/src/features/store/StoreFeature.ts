import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import uiUtil from '../../utilities/ui.utility'
import AbstractFeature, {
	FeatureDependency,
	FeatureOptions,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
	interface FeatureMap {
		store: StoreFeature
	}
}

export default class StoreFeature extends AbstractFeature {
	public nameReadable = 'Data Stores'
	public description = 'For working with remote places of storage.'
	public code: FeatureCode = 'store'
	public dependencies: FeatureDependency[] = [
		{
			code: 'skill',
			isRequired: true,
		},
	]
	public packageDependencies = [
		{ name: '@sprucelabs/spruce-store-plugin@latest', isDev: false },
		{ name: '@sprucelabs/data-stores@latest', isDev: false },
	]

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			'test.register-abstract-test-classes',
			this.registerAbstractTestClassHandler.bind(this)
		)
		void this.emitter.on(
			'feature.will-execute',
			this.handleWillExecute.bind(this)
		)
	}

	private async registerAbstractTestClassHandler() {
		return {
			abstractClasses: [
				{
					name: 'AbstractStoreTest',
					label: 'AbstractStoreTest',
					import: '@sprucelabs/spruce-store-plugin',
					featureCode: 'store',
				},
			],
		}
	}

	private async handleWillExecute(payload: {
		featureCode: string
		actionCode: string
	}) {
		const isInstalled = await this.featureInstaller.isInstalled('store')

		if (
			isInstalled &&
			payload.featureCode === 'node' &&
			payload.actionCode === 'upgrade'
		) {
			uiUtil.renderMasthead({
				ui: this.ui,
				headline: 'Resyncing data stores...',
			})
			return this.Action('store', 'sync').execute({})
		}

		return {}
	}

	public async afterPackageInstall() {
		const files = await this.Writer('store').writePlugin(this.cwd)
		return {
			files,
		}
	}
}
