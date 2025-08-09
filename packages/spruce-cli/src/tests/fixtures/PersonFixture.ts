import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { SchemaError } from '@sprucelabs/schema'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import dotenv from 'dotenv'
import { ApiClientFactory } from '../../types/apiClient.types'

dotenv.config({ quiet: true })

export const DEMO_NUMBER = process.env.DEMO_NUMBER as string

export default class PersonFixture {
    private connectToApi: ApiClientFactory

    public constructor(apiClientFactory: ApiClientFactory) {
        this.connectToApi = apiClientFactory
    }

    public async loginAsDemoPerson(
        phone?: string
    ): Promise<SpruceSchemas.SpruceCli.v2020_07_22.PersonWithToken> {
        const client = await this.connectToApi()

        //@ts-ignore
        if (!phone && client.auth?.person) {
            //@ts-ignore
            return client.auth.person
        }

        phone = phone || DEMO_NUMBER

        if (!phone) {
            throw new SchemaError({
                code: 'MISSING_PARAMETERS',
                parameters: ['env.DEMO_NUMBER'],
            })
        }

        //@ts-ignore
        if (client.auth?.person?.phone === phone) {
            //@ts-ignore
            return client.auth.person
        }

        const requestPinResults = await client.emit(
            'request-pin::v2020_12_25',
            {
                payload: { phone },
            }
        )

        const { challenge } =
            eventResponseUtil.getFirstResponseOrThrow(requestPinResults)

        const confirmPinResults = await client.emit(
            'confirm-pin::v2020_12_25',
            {
                payload: { challenge, pin: phone.substr(-4) },
            }
        )

        const { person, token } =
            eventResponseUtil.getFirstResponseOrThrow(confirmPinResults)

        const personWithToken = { ...person, token }

        //@ts-ignore
        client.auth = { person: personWithToken }

        return personWithToken
    }

    public async logout() {
        const client = await this.connectToApi()

        await client.emit('logout::v2020_12_25')

        //@ts-ignore
        delete client.auth
    }
}
