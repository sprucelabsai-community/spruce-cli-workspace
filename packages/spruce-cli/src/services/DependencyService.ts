import { SettingsService } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../errors/SpruceError'

interface Dependency {
    id: string
    namespace: string
}

export default class DependencyService {
    private settings: SettingsService<string>
    public constructor(settings: SettingsService) {
        this.settings = settings
    }

    public set(dependencies: Dependency[]) {
        this.settings.set('dependencies', dependencies)
    }

    public add(dependency: Dependency) {
        this.assertDependencyDoesNotExist(dependency.namespace)

        const dependencies = this.settings.get('dependencies') ?? []
        dependencies.push(dependency)
        this.settings.set('dependencies', dependencies)
    }
    private assertDependencyDoesNotExist(namespace: string) {
        const dependencies = this.get()
        const match = dependencies.find((d) => d.namespace === namespace)

        if (match) {
            throw new SpruceError({
                code: 'DEPENDENCY_EXISTS',
                namespace,
            })
        }
    }

    public get(): Dependency[] {
        return this.settings.get('dependencies') ?? []
    }
}
