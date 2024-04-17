import {
    HASH_SPRUCE_DIR,
    SettingsService,
    diskUtil,
} from '@sprucelabs/spruce-skill-utils'
import { assert, test } from '@sprucelabs/test-utils'
import EventCacheService from '../../features/event/services/EventCacheService'
import ServiceFactory from '../../services/ServiceFactory'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class EventCacheServiceTest extends AbstractCliTest {
    @test()
    protected static async writesToHashSpruceCacheJson() {
        ServiceFactory.serviceClassOverides['eventCache'] = SpyEventCacheService
        ServiceFactory.serviceClassOverides['settings'] = SpySettingsService

        const settings = this.Service('eventCache') as SpyEventCacheService
        const expected = diskUtil.resolvePath(
            this.cwd,
            HASH_SPRUCE_DIR,
            'event-cache.json'
        )
        const actual = settings.getCacheFilePath()
        assert.isEqual(actual, expected)
    }
}

class SpyEventCacheService extends EventCacheService {
    public getCacheFilePath() {
        return (this.settings as SpySettingsService).getSettingsPath()
    }
}

class SpySettingsService extends SettingsService<string> {
    public getSettingsPath() {
        return super.getSettingsPath()
    }
}
