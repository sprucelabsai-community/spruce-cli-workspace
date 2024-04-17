import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class OrganizationFeature extends AbstractFeature {
    public code: FeatureCode = 'organization'
    public nameReadable = 'Organization'
    public description = 'Manage the organizations you are part of'
    public dependencies: FeatureDependency[] = [
        {
            code: 'skill',
            isRequired: true,
        },
        {
            code: 'event',
            isRequired: true,
        },
    ]
    public packageDependencies = []

    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
}

declare module '../../features/features.types' {
    interface FeatureMap {
        organization: OrganizationFeature
    }
}
