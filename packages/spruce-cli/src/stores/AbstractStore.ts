import { GlobalEmitter } from '../GlobalEmitter'
import ServiceFactory, {
    ServiceProvider,
    Service,
    ServiceMap,
} from '../services/ServiceFactory'
import {
    ApiClientFactory,
    ApiClient,
    ApiClientFactoryOptions,
} from '../types/apiClient.types'

export default abstract class AbstractStore implements ServiceProvider {
    protected cwd: string
    protected homeDir: string
    protected apiClientFactory: ApiClientFactory
    protected emitter: GlobalEmitter

    public abstract name: string

    private serviceFactory: ServiceFactory

    public constructor(options: StoreOptions) {
        this.cwd = options.cwd
        this.serviceFactory = options.serviceFactory
        this.homeDir = options.homeDir
        this.apiClientFactory = options.apiClientFactory
        this.emitter = options.emitter
    }

    public Service<S extends Service>(type: S, cwd?: string): ServiceMap[S] {
        return this.serviceFactory.Service(cwd ?? this.cwd, type)
    }

    protected async connectToApi(
        options?: ApiClientFactoryOptions
    ): Promise<ApiClient> {
        return this.apiClientFactory(options)
    }
}

interface AbstractStoreOptions {
    serviceFactory: ServiceFactory
    cwd: string
    homeDir: string
    apiClientFactory: ApiClientFactory
    emitter: GlobalEmitter
}

export type StoreOptions<
    Options extends Record<string, any> | undefined = undefined,
> =
    Options extends Record<string, any>
        ? AbstractStoreOptions & Options
        : AbstractStoreOptions
