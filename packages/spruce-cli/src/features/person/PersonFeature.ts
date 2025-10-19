import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractFeature from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class PersonFeature extends AbstractFeature {
    public code: FeatureCode = 'person'
    public nameReadable = 'Person'
    public description = 'Log in, log out, etc.'
    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public isInstalled = async () => {
        return true
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        person: PersonFeature
    }

    interface FeatureOptionsMap {
        person: undefined
    }
}
