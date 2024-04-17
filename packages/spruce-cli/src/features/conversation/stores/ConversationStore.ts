import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore from '../../../stores/AbstractStore'

export interface EventStoreFetchEventContractsResponse {
    errors: SpruceError[]
    topics: SpruceSchemas.Mercury.v2020_12_25.GetConversationTopicsTopic[]
}

export default class ConversationStore extends AbstractStore {
    public name = 'event'

    public async fetchRegisteredTopics() {
        const client = await this.connectToApi()
        const results = await client.emit(
            'get-conversation-topics::v2020_12_25'
        )
        const { payloads, errors } =
            eventResponseUtil.getAllResponsePayloadsAndErrors(
                results,
                SpruceError
            )

        const topics = payloads[0]?.topics ?? []

        return { topics, errors }
    }
}
