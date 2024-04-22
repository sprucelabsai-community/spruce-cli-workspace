import { MutableContractClient } from '@sprucelabs/mercury-client'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore from '../../../stores/AbstractStore'

export default class ViewStore extends AbstractStore {
    public name = 'view'

    public async fetchSkillViews() {
        const client = await this.connectToApi({
            shouldAuthAsCurrentSkill: true,
        })
        // @ts-ignore
        delete client._eventContract
        // @ts-ignore
        delete MutableContractClient.inMemoryContract

        const skill = this.Service('auth').getCurrentSkill()

        if (!skill) {
            throw new SpruceError({
                code: 'SKILL_NOT_REGISTERED',
                friendlyMessage: `You can't get skill views without being registered. Try \`spruce register\``,
            })
        }

        const results = await client.emit(
            'heartwood.get-skill-views::v2021_02_11' as any,
            {
                target: {
                    namespace: skill.slug,
                },
            }
        )

        const views = eventResponseUtil.getFirstResponseOrThrow(results)

        return views
    }
}
