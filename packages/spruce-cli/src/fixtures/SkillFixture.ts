import { EventContract, SpruceSchemas } from '@sprucelabs/mercury-types'
import { RegisterSkillOptions } from '../features/skill/stores/SkillStore'
import StoreFactory from '../stores/StoreFactory'
import {
	ApiClientFactory,
	ApiClientFactoryOptions,
} from '../types/apiClient.types'
import apiClientUtil from '../utilities/apiClient.utility'
import PersonFixture from './PersonFixture'

export default class SkillFixture {
	private storeFactory: StoreFactory
	private apiClientFactory: ApiClientFactory
	private personFixture: PersonFixture

	private static skillCount = Math.round(Math.random() * 100)

	public constructor(
		personFixture: PersonFixture,
		storeFactory: StoreFactory,
		apiClientFactory: ApiClientFactory
	) {
		this.personFixture = personFixture
		this.storeFactory = storeFactory
		this.apiClientFactory = apiClientFactory
	}

	public async seedDemoSkill(values: { name: string }) {
		return this.registerCurrentSkill(values, {
			isRegisteringCurrentSkill: false,
		})
	}

	public async registerCurrentSkill(
		values: { name: string; slug?: string },
		options?: RegisterSkillOptions
	) {
		await this.personFixture.loginAsDemoPerson()

		return this.storeFactory.Store('skill').register(
			{
				slug: values.slug ?? this.generateSkillSlug(),
				...values,
			},
			options
		)
	}

	private generateSkillSlug(): string {
		SkillFixture.skillCount++
		return `my-skill-${new Date().getTime()}-count-${SkillFixture.skillCount}`
	}

	public async registerEventContract(
		auth: ApiClientFactoryOptions | SpruceSchemas.Spruce.v2020_07_22.Skill,
		contract: EventContract
	) {
		const skillAuth = apiClientUtil.skillOrAuthToAuth(auth)
		const client = await this.apiClientFactory(skillAuth)

		const eventStore = this.storeFactory.Store('event', {
			apiClientFactory: async () => {
				return client
			},
		})

		await eventStore.registerEventContract({
			eventContract: contract,
		})
	}

	public async clearAllSkills() {
		await this.personFixture.loginAsDemoPerson()

		const skillStore = this.storeFactory.Store('skill')
		const skills = await skillStore.fetchMySkills()

		for (const skill of skills) {
			await skillStore.unregisterSkill(skill.id)
		}
	}
}
