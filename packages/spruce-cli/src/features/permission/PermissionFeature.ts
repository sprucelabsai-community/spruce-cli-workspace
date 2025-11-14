import { PermissionContractMap } from '@sprucelabs/mercury-types'
import { diskUtil, NpmPackage } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, {
    FeatureOptions,
    InstallResults,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'
import PermissionWriter from './writers/PermissionWriter'

export default class PermissionFeature extends AbstractFeature {
    public code: FeatureCode = 'permission'
    public nameReadable = 'permission'
    public description = 'Manage permissions for your skill'
    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
    public _packageDependencies: NpmPackage[] = [
        {
            name: '@sprucelabs/spruce-permission-plugin@latest',
        },
    ]
    private writer: PermissionWriter

    public constructor(options: FeatureOptions) {
        super(options)
        this.writer = this.Writer('permission')

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
        const isSkillInstalled = await this.features.isInstalled('skill')
        const isUpgrading = featureCode === 'node' && actionCode === 'upgrade'
        const isSyncingEvents = featureCode === 'event' && actionCode === 'sync'

        if (isInstalled && (isUpgrading || isSyncingEvents)) {
            const combinedFile = isSkillInstalled
                ? await this.writePlugin()
                : []
            const results = await this.Action('permission', 'sync').execute({})

            results.files = [...(results.files ?? []), ...combinedFile]
            return results
        }

        return {}
    }

    public async afterPackageInstall(): Promise<InstallResults> {
        const isInstalled = await this.features.isInstalled('skill')
        if (!isInstalled) {
            return {}
        }
        const files = await this.writePlugin()
        const combinedFile = await this.writeTypesFile()

        return {
            files: [...files, ...combinedFile],
        }
    }

    private async writeTypesFile() {
        return await this.writer.writeTypesFile(
            this.cwd,
            {} as PermissionContractMap
        )
    }

    private async writePlugin() {
        return this.writer.writePlugin(this.cwd)
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        permission: PermissionFeature
    }

    interface FeatureOptionsMap {
        permission: undefined
    }
}
