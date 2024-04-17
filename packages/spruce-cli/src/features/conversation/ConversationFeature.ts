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
            name: '@sprucelabs/spruce-conversation-plugin@latest',
            isDev: false,
        },
    ]
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
        const isInstalled = await this.features.isInstalled('conversation')

        if (
            payload.featureCode === 'node' &&
            payload.actionCode === 'upgrade' &&
            isInstalled
        ) {
            const files = await this.writePlugin()
            return { files }
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
        return this.Writer('conversation').writePlugin(this.cwd)
    }
}
