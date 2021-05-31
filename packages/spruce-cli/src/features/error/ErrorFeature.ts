import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { NpmPackage } from '../../types/cli.types'
import AbstractFeature, {
	FeatureDependency,
	FeatureOptions,
	InstallResults,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
	interface FeatureMap {
		error: ErrorFeature
	}

	interface FeatureOptionsMap {
		error: undefined
	}
}

export default class ErrorFeature extends AbstractFeature {
	public nameReadable = 'error handling'
	public description =
		'Errors: Use schemas to define your errors and get great type checking!'
	public code: FeatureCode = 'error'

	public dependencies: FeatureDependency[] = [
		{ code: 'schema', isRequired: true },
		{ code: 'node', isRequired: true },
	]
	public packageDependencies: NpmPackage[] = [
		{
			name: '@sprucelabs/error',
		},
	]
	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			'feature.will-execute',
			this.handleWillExecuteCommand.bind(this)
		)
	}

	private async handleWillExecuteCommand(payload: {
		actionCode: string
		featureCode: string
	}) {
		const isSkillInstalled = await this.featureInstaller.isInstalled('error')

		if (
			payload.featureCode === 'skill' &&
			payload.actionCode === 'upgrade' &&
			isSkillInstalled
		) {
			const files = await this.writePlugin()
			return {
				files,
			}
		}

		return {}
	}

	public async afterPackageInstall(): Promise<InstallResults> {
		const isSkillInstalled = await this.featureInstaller.isInstalled('skill')

		if (!isSkillInstalled) {
			return {}
		}

		const files = await this.writePlugin()

		return {
			files,
		}
	}

	private async writePlugin() {
		return this.Writer('error').writePlugin(this.cwd)
	}
}
