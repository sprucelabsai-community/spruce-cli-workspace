import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { FileDescription } from '../../types/cli.types'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { FeatureCode } from '../features.types'

export default class AgentFeature extends AbstractFeature {
    public description = 'AI Agent support for your skill.'
    public code: FeatureCode = 'agent'
    public nameReadable = 'Agent'
    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')
    public dependencies: FeatureDependency[] = [
        { code: 'event', isRequired: true },
    ]
    public _packageDependencies = [
        {
            name: '@sprucelabs/spruce-agent-plugin',
        },
    ]

    public readonly fileDescriptions: FileDescription[] = []
}

declare module '../../features/features.types' {
    interface FeatureMap {
        agent: AgentFeature
    }

    interface FeatureOptionsMap {
        agent: undefined
    }
}
