import { SpruceSchemas } from '@sprucelabs/spruce-core-schemas'
import SpruceError from '../errors/SpruceError'
import { ApiClientFactoryOptions } from '../types/apiClient.types'

type Skill = SpruceSchemas.Spruce.v2020_07_22.Skill

const apiClientUtil = {
	generateClientCacheKey: (options?: ApiClientFactoryOptions) => {
		if (options?.shouldAuthAsCurrentSkill) {
			return 'skill'
		}

		if (!options || (!options.token && !options.skillId)) {
			return 'anon'
		}

		if (options.token) {
			return `person:${options.token}`
		}

		if (options.skillId && options.apiKey) {
			return `skill:${options.skillId}:${options.apiKey}`
		}

		throw new SpruceError({
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
			throw new SpruceError({
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
