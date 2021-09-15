import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { normalizeSchemaValues, validateSchemaValues } from '@sprucelabs/schema'
import { EnvService } from '@sprucelabs/spruce-skill-utils'
import personWithTokenSchema from '#spruce/schemas/spruceCli/v2020_07_22/personWithToken.schema'

type PersonWithToken = SpruceSchemas.SpruceCli.v2020_07_22.PersonWithToken

export interface SkillAuth {
	id: string
	apiKey: string
	name: string
	slug: string
}

const LOGGED_IN_PERSON_KEY = 'LOGGED_IN_PERSON'

export default class AuthService {
	private env: EnvService

	public constructor(envService: EnvService) {
		this.env = envService
	}

	public getLoggedInPerson(): PersonWithToken | null {
		const p = this.env.get(LOGGED_IN_PERSON_KEY)
		if (typeof p === 'string') {
			return JSON.parse(p)
		}

		return null
	}

	public setLoggedInPerson(person: PersonWithToken) {
		const normalized = normalizeSchemaValues(personWithTokenSchema, person)
		validateSchemaValues(personWithTokenSchema, normalized)

		this.env.set(
			LOGGED_IN_PERSON_KEY,
			JSON.stringify({
				...normalized,
				isLoggedIn: true,
			})
		)
	}

	public logOutPerson() {
		this.env.unset(LOGGED_IN_PERSON_KEY)
	}

	public getCurrentSkill(): SkillAuth | null {
		const id = this.env.get('SKILL_ID') as string
		const apiKey = this.env.get('SKILL_API_KEY') as string
		const name = this.env.get('SKILL_NAME') as string
		const slug = this.env.get('SKILL_SLUG') as string

		if (id && apiKey) {
			return {
				id,
				apiKey,
				name,
				slug,
			}
		}

		return null
	}

	public logoutCurrentSkill() {
		this.env.unset('SKILL_ID')
		this.env.unset('SKILL_API_KEY')
		this.env.unset('SKILL_NAME')
		this.env.unset('SKILL_SLUG')
	}

	public updateCurrentSkill(skill: SkillAuth) {
		this.env.set('SKILL_ID', skill.id)
		this.env.set('SKILL_API_KEY', skill.apiKey)
		this.env.set('SKILL_NAME', skill.name)
		this.env.set('SKILL_SLUG', skill.slug)
	}
}
