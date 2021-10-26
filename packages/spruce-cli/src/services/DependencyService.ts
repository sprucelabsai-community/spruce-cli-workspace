import { SettingsService } from '@sprucelabs/spruce-skill-utils'

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
		const dependencies = this.settings.get('dependencies') ?? []
		dependencies.push(dependency)
		this.settings.set('dependencies', dependencies)
	}

	public get(): Dependency[] {
		return this.settings.get('dependencies') ?? []
	}
}
