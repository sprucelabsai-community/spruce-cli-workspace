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
			name: '@sprucelabs/error@latest',
		},
	]
	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			'feature.did-execute',
			this.handleDidExecuteCommand.bind(this)
		)

		void this.emitter.on('skill.will-write-directory-template', async () => {
			const isInstalled = await this.featureInstaller.isInstalled('error')
			if (isInstalled) {
				return {
					filesToSkip: ['options.types.ts'],
				}
			}

			return {}
		})
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

	private async handleDidExecuteCommand(payload: {
		featureCode: string
		actionCode: string
	}) {
		const { featureCode, actionCode } = payload
		const isInstalled = await this.featureInstaller.isInstalled('error')
		const isSkillInstalled = await this.featureInstaller.isInstalled('skill')

		if (isInstalled && featureCode === 'node' && actionCode === 'upgrade') {
			const results = await this.Action('error', 'sync').execute({})

			if (isSkillInstalled) {
				if (!results.files) {
					results.files = []
				}

				const plugin = await this.writePlugin()
				results.files.push(...plugin)
			}

			return results
		}

		return {}
	}
	private async writePlugin() {
		return this.Writer('error').writePlugin(this.cwd)
	}
}
