import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import uiUtil from '../../utilities/ui.utility'
import AbstractFeature, { FeatureDependency } from '../AbstractFeature'
import { ActionOptions, FeatureCode } from '../features.types'

export default class SandboxFeature extends AbstractFeature {
    public code: FeatureCode = 'sandbox'
    public nameReadable = 'Sandbox'
    public description =
        'For getting your skill up-and-running on sandbox.mercury.spruce.ai.'
    public dependencies: FeatureDependency[] = [
        {
            code: 'event',
            isRequired: true,
        },
    ]
    public actionsDir = diskUtil.resolvePath(__dirname, 'actions')

    public constructor(options: ActionOptions) {
        super(options)

        void this.emitter.on('feature.will-execute', async (payload) => {
            const isSkillInstalled = await this.features.isInstalled('sandbox')
            if (
                isSkillInstalled &&
                payload.featureCode === 'node' &&
                payload.actionCode === 'upgrade'
            ) {
                uiUtil.renderMasthead({
                    ui: this.ui,
                    headline: 'Updating sandbox support...',
                })

                return this.Action('sandbox', 'setup').execute({})
            }

            return {}
        })
    }
}

declare module '../../features/features.types' {
    interface FeatureMap {
        sandbox: SandboxFeature
    }

    interface FeatureOptionsMap {
        sandbox: undefined
    }
}
