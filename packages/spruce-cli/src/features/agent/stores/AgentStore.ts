import AbstractStore from '../../../stores/AbstractStore'

export default class AgentStore extends AbstractStore {
    public name = 'agent'

    public async getPlatformAgent() {
        const client = await this.connectToApi({
            shouldAuthAsCurrentSkill: true,
        })
        const [{ agent }] = await client.emitAndFlattenResponses(
            'get-agent::v2020_12_25'
        )

        return agent
    }
}
