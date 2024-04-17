import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature from '../AbstractFeature'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
    interface FeatureMap {
        cache: CacheFeature
    }
}

export default class CacheFeature extends AbstractFeature {
    public description = 'Caching for all things Sprucebot.'
    public code: FeatureCode = 'cache'
    public nameReadable = 'Cache'
    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public async isInstalled() {
        return true
    }
}
