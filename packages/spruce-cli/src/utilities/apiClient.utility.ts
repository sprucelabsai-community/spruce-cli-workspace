import { SchemaError } from '@sprucelabs/schema'
import { SpruceSchemas } from '@sprucelabs/spruce-core-schemas'
import { ApiClientFactoryOptions } from '../types/apiClient.types'

type Skill = SpruceSchemas.Spruce.v2020_07_22.Skill

const apiClientUtil = {
    generateClientCacheKey: (options?: ApiClientFactoryOptions) => {
        if (options?.shouldAuthAsCurrentSkill) {
            return 'skill'
        }

        if (options?.shouldAuthAsLoggedInPerson === false) {
            return 'anon'
        }

        if (!options || (!options.token && !options.skillId)) {
            return 'loggedInPersonOrAnon'
        }

        if (options.token) {
            return `person:${options.token}`
        }

        if (options.skillId && options.apiKey) {
            return `skill:${options.skillId}:${options.apiKey}`
        }

        throw new SchemaError({
            code: 'INVALID_PARAMETERS',
            parameters: [
                !options.token && 'token',
                !options.skillId && 'skillId',
                !options.apiKey && 'apiKey',
            ].filter((p) => !!p) as string[],
            friendlyMessage: `You must pass a token to login as a person or a skillId and apiKey to login as a skill.`,
        })
    },

    skillOrAuthToAuth(auth: ApiClientFactoryOptions | Skill) {
        let { skillId } = auth as ApiClientFactoryOptions
        let { id } = auth as Skill

        skillId = id ?? skillId

        if (!skillId) {
            throw new SchemaError({
                code: 'MISSING_PARAMETERS',
                parameters: ['auth.skillId'],
            })
        }

        const skillAuth = {
            skillId,
            apiKey: auth.apiKey,
        }

        return skillAuth
    },
}

export default apiClientUtil
