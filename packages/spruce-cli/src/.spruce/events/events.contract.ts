import { coreEventContracts } from '@sprucelabs/mercury-core-events'

import spruceCliRegisterSkillViewsEventContract_v2021_04_11, {
    RegisterSkillViewsEventContract as SpruceCliRegisterSkillViewsEventContract_v2021_04_11,
} from '#spruce/events/spruceCli/registerSkillViews.v2021_04_11.contract'

export default [
    spruceCliRegisterSkillViewsEventContract_v2021_04_11,
    ...coreEventContracts,
]

declare module '@sprucelabs/mercury-types/build/types/mercury.types' {
    interface SkillEventSignatures {
        'spruce-cli.register-skill-views::v2021_04_11': SpruceCliRegisterSkillViewsEventContract_v2021_04_11['eventSignatures']['spruce-cli.register-skill-views::v2021_04_11']
    }
}
