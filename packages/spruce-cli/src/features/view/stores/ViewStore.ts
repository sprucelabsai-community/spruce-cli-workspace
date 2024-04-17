import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore from '../../../stores/AbstractStore'

export default class ViewStore extends AbstractStore {
    public name = 'view'

    public async fetchSkillViews() {
        const client = await this.connectToApi({
            shouldAuthAsCurrentSkill: true,
        })
        const skill = this.Service('auth').getCurrentSkill()

        if (!skill) {
            throw new SpruceError({
                code: 'SKILL_NOT_REGISTERED',
                friendlyMessage: `You can't get skill views without being registered. Try \`spruce register\``,
            })
        }

        try {
            const results = await client.emit(
                'heartwood.get-skill-views::v2021_02_11',
                {
                    target: {
                        namespace: skill.slug,
                    },
                }
            )

            const views = eventResponseUtil.getFirstResponseOrThrow(results)

            return views
        } catch (err) {
            return null
        }
    }
}
