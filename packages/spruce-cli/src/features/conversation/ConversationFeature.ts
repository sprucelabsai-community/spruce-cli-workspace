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
		conversation: ConversationFeature
	}
}

export default class ConversationFeature extends AbstractFeature {
	public nameReadable = 'Conversation'
	public code: FeatureCode = 'conversation'
	public description = 'Computers like to talk, too.'

	public dependencies: FeatureDependency[] = [
		{ code: 'event', isRequired: true },
	]
	public packageDependencies: NpmPackage[] = [
		{
			name: '@sprucelabs/spruce-conversation-plugin',
			isDev: false,
		},
	]
	protected actionsDir = diskUtil.resolvePath(__dirname, 'actions')

	public constructor(options: FeatureOptions) {
		super(options)

		void this.emitter.on('skill.did-upgrade', async () => {
			const isInstalled = await this.featureInstaller.isInstalled(
				'conversation'
			)

			if (isInstalled) {
				const files = await this.writePlugin()
				return { files }
			}

			return {}
		})
	}

	public async afterPackageInstall(): Promise<InstallResults> {
		const files = await this.writePlugin()

		return {
			files,
		}
	}

	private async writePlugin() {
		return this.Writer('conversation').writePlugin(this.cwd)
	}
}
