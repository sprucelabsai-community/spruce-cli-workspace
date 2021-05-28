import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, {
	FeatureDependency,
	InstallResults,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
	interface FeatureMap {
		deploy: DeployFeature
	}
}

export default class DeployFeature extends AbstractFeature {
	public description = 'Deploy your skill with ease. '
	public code: FeatureCode = 'deploy'
	public nameReadable = 'Deploy'
	public dependencies: FeatureDependency[] = [
		{
			code: 'node',
			isRequired: true,
		},
	]
	public packageDependencies = [
		{ name: '@sprucelabs/spruce-deploy-plugin', isDev: false },
	]

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public async afterPackageInstall(): Promise<InstallResults> {
		const files = await this.Writer('deploy').writePlugin(this.cwd)

		return {
			files,
		}
	}
}
