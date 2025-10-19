import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, {
    FeatureDependency,
    FeatureOptions,
    InstallResults,
    PackageDependency,
} from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class SchemaFeature extends AbstractFeature {
    public nameReadable = 'Schema'
    public description = 'Define, validate, and normalize everything.'
    public dependencies: FeatureDependency[] = [
        { code: 'skill', isRequired: false },
        { code: 'node', isRequired: true },
    ]
    public packageDependencies: PackageDependency[] = [
        {
            name: '@sprucelabs/schema@latest',
        },
        {
            name: '@sprucelabs/spruce-core-schemas@latest',
        },
        { name: '@sprucelabs/resolve-path-aliases@latest', isDev: true },
        {
            name: '@sprucelabs/spruce-skill-utils',
        },
        {
            type: 'go',
            name: 'github.com/sprucelabsai-community/spruce-schema/v32/pkg/fields',
        },
    ]

    public code: FeatureCode = 'schema'

    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public constructor(options: FeatureOptions) {
        super(options)

        void this.emitter.on(
            'feature.will-execute',
            this.handleWillExecute.bind(this)
        )

        void this.emitter.on(
            'feature.did-execute',
            this.handleDidExecute.bind(this)
        )
    }

    private async handleWillExecute(payload: {
        actionCode: string
        featureCode: string
    }) {
        const isInstalled = await this.features.isInstalled('schema')
        const isSkillInstalled = await this.features.isInstalled('skill')

        if (
            payload.featureCode === 'node' &&
            payload.actionCode === 'upgrade' &&
            isInstalled &&
            isSkillInstalled
        ) {
            const files = await this.writePlugin()
            return { files }
        }

        return {}
    }

    private async handleDidExecute(payload: {
        actionCode: string
        featureCode: string
    }) {
        const isInstalled = await this.features.isInstalled('schema')

        if (
            payload.featureCode === 'node' &&
            payload.actionCode === 'upgrade' &&
            isInstalled
        ) {
            const hasLocalSchemas = await this.Store('schema').hasLocalSchemas()
            if (hasLocalSchemas) {
                const results = await this.Action('schema', 'sync').execute({})

                return results
            }
        }

        return {}
    }

    public async afterPackageInstall(): Promise<InstallResults> {
        const isSkillInstalled = await this.features.isInstalled('skill')

        if (!isSkillInstalled) {
            return {}
        }

        this.Service('settings').markAsInstalled(this.code)

        const files = await this.writePlugin()

        return {
            files,
        }
    }

    private async writePlugin() {
        return this.Writer('schema').writePlugin(this.cwd)
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        schema: SchemaFeature
    }

    interface FeatureOptionsMap {
        schema: undefined
    }
}
