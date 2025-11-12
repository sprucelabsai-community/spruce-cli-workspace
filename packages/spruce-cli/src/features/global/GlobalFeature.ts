import { diskUtil, NpmPackage } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class GlobalFeature extends AbstractFeature {
    public code: FeatureCode = 'global'
    public nameReadable = 'Global'
    public description =
        'Place for all global actions that affect your Spruce account (outside your profile).'
    public dependencies: FeatureDependency[] = []
    public _packageDependencies: NpmPackage[] = []

    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
    public scripts = {}

    public async isInstalled(): Promise<boolean> {
        return true
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        global: GlobalFeature
    }

    interface FeatureOptionsMap {
        global: undefined
    }
}
