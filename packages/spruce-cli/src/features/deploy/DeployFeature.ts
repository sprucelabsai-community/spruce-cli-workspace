import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, {
    FeatureDependency,
    InstallResults,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class DeployFeature extends AbstractFeature {
    public description = 'Deploy your skill with ease.'
    public code: FeatureCode = 'deploy'
    public nameReadable = 'Deploy'
    public dependencies: FeatureDependency[] = [
        {
            code: 'node',
            isRequired: true,
        },
    ]
    public _packageDependencies = [
        { name: '@sprucelabs/spruce-deploy-plugin@latest', isDev: false },
    ]

    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public async afterPackageInstall(): Promise<InstallResults> {
        const files = await this.Writer('deploy').writePlugin(this.cwd)

        return {
            files,
        }
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        deploy: DeployFeature
    }

    interface FeatureOptionsMap {
        deploy: undefined
    }
}
