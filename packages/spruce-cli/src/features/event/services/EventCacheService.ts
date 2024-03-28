import { SettingsService } from '@sprucelabs/spruce-skill-utils'

export default class EventCacheService {
	protected settings: SettingsService<string>

	public constructor(settings: SettingsService) {
		this.settings = settings
		this.settings.setFile('event-cache.json')
	}

	public getLastSyncOptions() {
		return this.settings.get('events.lastSync')
	}

	public setLastSyncCache(options: {
		shouldSyncOnlyCoreEvents?: boolean | null
	}) {
		this.settings.set('events.lastSync', options)
	}

	public setListenerCache(value: Record<string, any>) {
		this.settings.set('events.listenerCacheKeys', value)
	}

	public clearListenerCache() {
		this.settings.unset('events.listenerCacheKeys')
	}

	public getListenerCache() {
		return this.settings.get('events.listenerCacheKeys')
	}
}
