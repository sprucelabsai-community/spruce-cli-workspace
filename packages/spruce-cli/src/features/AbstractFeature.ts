import pathUtil from 'path'
import globby from '@sprucelabs/globby'
import { Schema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { Templates } from '@sprucelabs/spruce-templates'
import { GlobalEmitter } from '../GlobalEmitter'
import ServiceFactory, {
    Service,
    ServiceProvider,
    ServiceMap,
} from '../services/ServiceFactory'
import StoreFactory, {
    StoreCode,
    CreateStoreOptions,
    StoreMap,
} from '../stores/StoreFactory'
import {
    ApiClient,
    ApiClientFactory,
    ApiClientFactoryOptions,
} from '../types/apiClient.types'
import { NpmPackage, GeneratedFile, FileDescription } from '../types/cli.types'
import { GraphicsInterface } from '../types/cli.types'
import { WriterOptions } from '../writers/AbstractWriter'
import WriterFactory, { WriterCode, WriterMap } from '../writers/WriterFactory'
import ActionExecuter from './ActionExecuter'
import ActionFactory from './ActionFactory'
import featuresUtil from './feature.utilities'
import FeatureInstaller from './FeatureInstaller'
import { FeatureCode } from './features.types'

export default abstract class AbstractFeature<
    S extends Schema | undefined = Schema | undefined,
> implements ServiceProvider
{
    public abstract description: string
    public readonly dependencies: FeatureDependency[] = []
    public readonly packageDependencies: PackageDependency[] = []
    public readonly optionsSchema?: S
    public readonly fileDescriptions: FileDescription[] = []

    public isInstalled?(): Promise<boolean>

    public abstract readonly code: FeatureCode
    public abstract readonly nameReadable: string
    public readonly installOrderWeight: number = 0

    public cwd: string
    public scripts: Record<string, any> = {}
    public actionsDir: string | undefined
    protected actions?: ActionFactory
    protected templates: Templates
    protected emitter: GlobalEmitter
    protected features: FeatureInstaller
    protected ui: GraphicsInterface

    private serviceFactory: ServiceFactory
    private storeFactory: StoreFactory
    private writers: WriterFactory
    private apiClientFactory: ApiClientFactory
    private actionExecuter: ActionExecuter
    private actionCodes?: string[]

    public constructor(options: FeatureOptions) {
        this.cwd = options.cwd
        this.serviceFactory = options.serviceFactory
        this.templates = options.templates
        this.actions = options.actionFactory
        this.storeFactory = options.storeFactory
        this.writers = new WriterFactory({
            templates: this.templates,
            ui: options.ui,
            settings: this.Service('settings'),
            linter: this.Service('lint'),
        })
        this.emitter = options.emitter
        this.features = options.featureInstaller
        this.ui = options.ui
        this.apiClientFactory = options.apiClientFactory
        this.actionExecuter = options.actionExecuter
    }

    protected Action(featureCode: string, actionCode: string) {
        return this.actionExecuter.Action(featureCode as any, actionCode)
    }

    public async beforePackageInstall(
        _options: S extends Schema ? SchemaValues<S> : undefined
    ): Promise<InstallResults> {
        return {}
    }

    public async afterPackageInstall(
        _options: S extends Schema ? SchemaValues<S> : undefined
    ): Promise<InstallResults> {
        return {}
    }

    public Service<S extends Service>(type: S, cwd?: string): ServiceMap[S] {
        return this.serviceFactory.Service(cwd ?? this.cwd, type)
    }

    public Writer<C extends WriterCode>(
        code: C,
        options?: Partial<WriterOptions>
    ): WriterMap[C] {
        return this.writers.Writer(code, {
            fileDescriptions: this.fileDescriptions,
            linter: this.Service('lint'),
            ...options,
        })
    }

    public getFeature<Code extends FeatureCode>(code: Code) {
        return this.features.getFeature(code)
    }

    public getProjectLanguage() {
        return diskUtil.detectProjectLanguage(this.cwd)
    }

    public async getAvailableActionCodes(): Promise<string[]> {
        if (!this.actionsDir) {
            return []
        }

        if (!this.actionCodes) {
            const matches: string[] = await globby(
                pathUtil.join(this.actionsDir, '**/*Action.js')
            )

            const codes: string[] = []

            for (const match of matches) {
                const generatedCode = featuresUtil.filePathToActionCode(match)
                codes.push(generatedCode)
            }

            this.actionCodes = codes
        }

        return this.actionCodes
    }

    public Store<C extends StoreCode>(
        code: C,
        options?: CreateStoreOptions<C>
    ): StoreMap[C] {
        return this.storeFactory.Store(code, {
            cwd: this.cwd,
            ...(options as any),
        })
    }

    protected async connectToApi(
        options?: ApiClientFactoryOptions
    ): Promise<ApiClient> {
        return this.apiClientFactory(options)
    }
}

export interface InstallResults {
    files?: GeneratedFile[]
    cwd?: string
}

export interface FeatureDependency {
    isRequired: boolean
    code: FeatureCode
}

export interface FeatureOptions {
    cwd: string
    serviceFactory: ServiceFactory
    templates: Templates
    storeFactory: StoreFactory
    actionFactory?: ActionFactory
    featureInstaller: FeatureInstaller
    ui: GraphicsInterface
    emitter: GlobalEmitter
    apiClientFactory: ApiClientFactory
    actionExecuter: ActionExecuter
}

export type PackageDependency = NpmPackage | GoPackage

export interface GoPackage {
    type: 'go'
    name: string
}
