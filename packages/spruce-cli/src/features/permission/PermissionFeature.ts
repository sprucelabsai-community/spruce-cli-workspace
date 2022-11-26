import { diskUtil, NpmPackage } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, {
	FeatureDependency,
	FeatureOptions,
	InstallResults,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class PermissionFeature extends AbstractFeature {
	public code: FeatureCode = 'permission'
	public nameReadable = 'permission'
	public description = 'Manage permissions for your skill'
	public dependencies: FeatureDependency[] = []
	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
	public packageDependencies: NpmPackage[] = [
		{
			name: '@sprucelabs/spruce-permission-plugin@latest',
		},
	]

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			'feature.did-execute',
			this.handleDidExecuteAction.bind(this)
		)
	}

	public async handleDidExecuteAction({
		featureCode,
		actionCode,
	}: {
		featureCode: string
		actionCode: string
	}) {
		const isInstalled = await this.features.isInstalled('permission')

		if (isInstalled && featureCode === 'skill' && actionCode === 'upgrade') {
			return await this.Action('permission', 'sync').execute({})
		}

		return {}
	}

	public async afterPackageInstall(): Promise<InstallResults> {
		const files = await this.writePlugin()

		return {
			files,
		}
	}

	private async writePlugin() {
		return this.Writer('permission').writePlugin(this.cwd)
	}
}

declare module '../../features/features.types' {
	interface FeatureMap {
		permission: PermissionFeature
	}
}
