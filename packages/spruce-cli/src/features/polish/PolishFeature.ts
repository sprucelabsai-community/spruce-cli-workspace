import { diskUtil, NpmPackage } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class PolishFeature extends AbstractFeature {
    public code: FeatureCode = 'polish'
    public nameReadable = 'Polish'
    public description =
        'Run through your skill as a robot, clicking and typing and asserting!'
    public dependencies: FeatureDependency[] = [
        {
            code: 'skill',
            isRequired: false,
        },
    ]
    public packageDependencies: NpmPackage[] = [
        {
            name: '@sprucelabs/heartwood-polish',
            isDev: true,
        },
    ]

    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
    public scripts = {
        polish: 'heartwood-polish',
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        polish: PolishFeature
    }
}
