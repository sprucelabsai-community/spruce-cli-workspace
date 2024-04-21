import {
    SettingsService,
    EnvService,
    AuthService,
} from '@sprucelabs/spruce-skill-utils'
import EventCacheService from '../features/event/services/EventCacheService'
import RemoteService from '../features/event/services/RemoteService'
import { FeatureCode } from '../features/features.types'
import SchemaService from '../features/schema/services/SchemaService'
import VsCodeService from '../features/vscode/services/VsCodeService'
import BuildService from './BuildService'
import CommandService from './CommandService'
import DependencyService from './DependencyService'
import ImportService from './ImportService'
import LintService from './LintService'
import PkgService from './PkgService'
import TypeCheckerService from './TypeCheckerService'

export default class ServiceFactory {
    public static serviceClassOverides: Record<string, any> = {}

    public static setServiceClass(name: Service, Class: any) {
        this.serviceClassOverides[name] = Class
    }

    public Service<S extends Service>(cwd: string, type: S): ServiceMap[S] {
        const Class = ServiceFactory.serviceClassOverides[type] as any

        switch (type) {
            case 'auth':
                return AuthService.Auth(cwd) as ServiceMap[S]
            case 'pkg':
                return new PkgService(
                    cwd,
                    this.Service(cwd, 'command')
                ) as ServiceMap[S]
            case 'env':
                return new EnvService(cwd) as ServiceMap[S]
            case 'vsCode':
                return new VsCodeService(cwd) as ServiceMap[S]
            case 'schema':
                return new SchemaService({
                    cwd,
                    command: new CommandService(cwd),
                }) as ServiceMap[S]
            case 'lint':
                return new (Class ?? LintService)(cwd, () =>
                    this.Service(cwd, 'command')
                ) as ServiceMap[S]
            case 'command': {
                return new CommandService(cwd) as ServiceMap[S]
            }
            case 'remote':
                return new RemoteService(new EnvService(cwd)) as ServiceMap[S]
            case 'typeChecker':
                return new TypeCheckerService(
                    this.buildImportService(cwd)
                ) as ServiceMap[S]
            case 'settings':
                //@ts-ignore
                return new (Class ?? SettingsService)<FeatureCode>(
                    cwd
                ) as ServiceMap[S]
            case 'dependency':
                return new DependencyService(
                    new SettingsService<FeatureCode>(cwd)
                ) as ServiceMap[S]
            case 'import':
                return this.buildImportService(cwd) as ServiceMap[S]
            case 'build': {
                const commandService = new CommandService(cwd)
                return new BuildService(
                    commandService,
                    new LintService(cwd, () => this.Service(cwd, 'command'))
                ) as ServiceMap[S]
            }
            case 'eventCache':
                return new (Class ?? EventCacheService)(
                    new SettingsService(cwd)
                ) as ServiceMap[S]
            default:
                throw new Error(`Service "${type}" not found`)
        }
    }

    private buildImportService(cwd: string): ImportService {
        return new ImportService({
            cwd,
            command: new CommandService(cwd),
        })
    }

    public static reset() {
        this.serviceClassOverides = {}
    }

    public static setFactoryClass(name: string, Class: any) {
        this.serviceClassOverides[name] = Class
    }
}

export interface ServiceMap {
    pkg: PkgService
    vsCode: VsCodeService
    schema: SchemaService
    lint: LintService
    command: CommandService
    typeChecker: TypeCheckerService
    import: ImportService
    build: BuildService
    settings: SettingsService
    env: EnvService
    auth: AuthService
    remote: RemoteService
    eventCache: EventCacheService
    dependency: DependencyService
}

export type Service = keyof ServiceMap

export interface ServiceProvider {
    Service<S extends Service>(type: S, cwd?: string): ServiceMap[S]
}
