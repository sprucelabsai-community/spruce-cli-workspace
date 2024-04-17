import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

declare module '../../features/features.types' {
    interface FeatureMap {
        log: LogFeature
    }

    interface FeatureOptionsMap {
        log: undefined
    }
}

export default class LogFeature extends AbstractFeature {
    public nameReadable = 'Logging support'
    public description = 'Logs: Configure how your skill logs and to where.'
    public code: FeatureCode = 'log'

    public dependencies: FeatureDependency[] = [
        { code: 'skill', isRequired: true },
    ]
    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public isInstalled() {
        return this.features.isInstalled('skill')
    }
}
