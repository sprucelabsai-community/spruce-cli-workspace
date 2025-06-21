import { Schema, SchemaValues } from '@sprucelabs/schema'
import { SpruceSchemas } from '@sprucelabs/spruce-core-schemas'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import nodeFeatureOptionsSchema from '#spruce/schemas/spruceCli/v2020_07_22/nodeFeatureOptions.schema'
import { FileDescription, GeneratedFile } from '../../types/cli.types'
import ScriptUpdaterImpl from '../../updaters/ScriptUpdater'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import {
    ActionOptions,
    FeatureActionResponse,
    FeatureCode,
} from '../features.types'
import universalDevDependencies from '../universalDevDependencies'
import universalFileDescriptions from '../universalFileDescriptions'
import universalScripts from '../universalScripts'

export default class NodeFeature<
    S extends OptionsSchema = OptionsSchema,
> extends AbstractFeature<S> {
    public code: FeatureCode = 'node'
    public nameReadable = 'nodejs support'
    public description = ''
    public dependencies: FeatureDependency[] = []
    public optionsSchema = nodeFeatureOptionsSchema as S
    public packageDependencies = [
        ...universalDevDependencies,
        { name: '@sprucelabs/resolve-path-aliases', isDev: true },
    ]

    public scripts = {
        ...universalScripts,
    }

    public readonly fileDescriptions: FileDescription[] = [
        ...universalFileDescriptions,
    ]

    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public constructor(options: ActionOptions) {
        super(options)

        void this.emitter.on('feature.did-execute', async (payload) => {
            const shouldUpgrade =
                payload.featureCode === 'node' &&
                payload.actionCode === 'upgrade' &&
                this.features.isInSpruceModule()

            if (shouldUpgrade) {
                return this.handleUpgrade()
            }

            return {}
        })
    }

    private async handleUpgrade(): Promise<FeatureActionResponse> {
        try {
            this.ui.clear()
            this.ui.renderHero('Upgrade')

            this.ui.startLoading('Cleaning build...')
            await this.Service('command').execute('yarn clean.build')

            const pkg = this.Service('pkg')
            const namespace = pkg.getSkillNamespace()

            this.ui.startLoading(`Building ${namespace} for development...`)

            await this.Service('build').build()

            return {
                summaryLines: [
                    'Build cleared.',
                    'Lint rules applied to source.',
                    'Code rebuilt successfully.',
                ],
            }
        } catch (err: any) {
            return {
                errors: [err],
            }
        }
    }

    public async beforePackageInstall(options: Options) {
        const destination = this.resolveDestination(options)

        if (!diskUtil.doesDirExist(destination)) {
            diskUtil.createDir(destination)
        }

        const files: GeneratedFile[] = [
            {
                name: 'package.json',
                path: diskUtil.resolvePath(destination, 'package.json'),
                action: 'generated',
            },
        ]

        await this.Service('command', destination).execute('yarn init -y')

        const written = await this.Writer('node').writeNodeModule(destination)

        files.push(...written)

        await this.installScripts(destination)

        return { files, cwd: destination }
    }

    private resolveDestination(options: Options) {
        return diskUtil.resolvePath(this.cwd, options.destination ?? '')
    }

    public async afterPackageInstall(
        options: S extends Schema ? SchemaValues<S> : undefined
    ) {
        const cwd = this.resolveDestination(options)
        const pkg = this.Service('pkg', cwd)

        pkg.set({ path: 'name', value: namesUtil.toKebab(options.name) })
        pkg.set({ path: 'description', value: options.description })
        pkg.set({ path: 'version', value: '0.0.1' })

        pkg.unset('main')
        pkg.unset('license')

        await this.Store('skill', {
            cwd,
        }).setCurrentSkillsNamespace(options.name)

        return {}
    }

    private async installScripts(destination = this.cwd) {
        const scriptUpdater = ScriptUpdaterImpl.FromFeature(this, {
            cwd: destination,
        })

        await scriptUpdater.update()
    }

    public isInstalled = async (): Promise<boolean> => {
        return diskUtil.doesFileExist(
            diskUtil.resolvePath(this.cwd, 'package.json')
        )
    }
}

type OptionsSchema =
    SpruceSchemas.SpruceCli.v2020_07_22.NodeFeatureOptionsSchema
type Options = SpruceSchemas.SpruceCli.v2020_07_22.NodeFeatureOptions

declare module '../../features/features.types' {
    interface FeatureMap {
        node: NodeFeature
    }

    interface FeatureOptionsMap {
        node: SchemaValues<OptionsSchema>
    }
}
