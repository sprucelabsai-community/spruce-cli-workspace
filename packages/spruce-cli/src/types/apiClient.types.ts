import { MercuryClient } from '@sprucelabs/mercury-client'
import { SpruceSchemas } from '@sprucelabs/mercury-types'

export type ApiClientFactoryOptions =
    SpruceSchemas.Mercury.v2020_12_25.AuthenticateEmitPayload & {
        shouldAuthAsCurrentSkill?: boolean
        shouldAuthAsLoggedInPerson?: boolean
    }
export type ApiClient = MercuryClient
export type ApiClientFactory = (
    options?: ApiClientFactoryOptions
) => Promise<ApiClient>
