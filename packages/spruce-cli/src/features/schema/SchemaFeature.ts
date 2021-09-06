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
		schema: SchemaFeature
	}

	interface FeatureOptionsMap {
		schema: undefined
	}
}

export default class SchemaFeature extends AbstractFeature {
	public nameReadable = 'Schema'
	public description = 'Define, validate, and normalize everything.'
	public dependencies: FeatureDependency[] = [
		{ code: 'skill', isRequired: false },
		{ code: 'node', isRequired: true },
	]
	public packageDependencies: NpmPackage[] = [
		{
			name: '@sprucelabs/schema@latest',
		},
		{
			name: '@sprucelabs/spruce-core-schemas@latest',
		},
		{ name: '@sprucelabs/resolve-path-aliases@latest', isDev: true },
	]

	public code: FeatureCode = 'schema'

	public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on(
			'feature.will-execute',
			this.handleWillExecute.bind(this)
		)
	}

	private async handleWillExecute(payload: {
		actionCode: string
		featureCode: string
	}) {
		const isSkillInstalled = await this.featureInstaller.isInstalled('schema')

		if (
			payload.featureCode === 'node' &&
			payload.actionCode === 'upgrade' &&
			isSkillInstalled
		) {
			const files = await this.writePlugin()
			return { files }
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
		return this.Writer('schema').writePlugin(this.cwd)
	}
}
