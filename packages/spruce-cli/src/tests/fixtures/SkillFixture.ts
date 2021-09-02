import { EventContract, SpruceSchemas } from '@sprucelabs/mercury-types'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import { RegisterSkillOptions } from '../../features/skill/stores/SkillStore'
import StoreFactory from '../../stores/StoreFactory'
import {
	ApiClientFactory,
	ApiClientFactoryOptions,
} from '../../types/apiClient.types'
import apiClientUtil from '../../utilities/apiClient.utility'
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
		options?: RegisterSkillOptions & { phone?: string }
	) {
		await this.personFixture.loginAsDemoPerson(options?.phone)

		return this.storeFactory.Store('skill').register(
			{
				slug: values.slug ?? this.generateSkillSlug(values.name),
				...values,
			},
			options
		)
	}

	private generateSkillSlug(name: string): string {
		SkillFixture.skillCount++
		return `${namesUtil.toKebab(name)}-${new Date().getTime()}-count-${
			SkillFixture.skillCount
		}`
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

	public async unRegisterEvents(
		auth: ApiClientFactoryOptions | SpruceSchemas.Spruce.v2020_07_22.Skill,
		options: SpruceSchemas.Mercury.v2020_12_25.UnregisterEventsEmitPayload
	) {
		const skillAuth = apiClientUtil.skillOrAuthToAuth(auth)
		const client = await this.apiClientFactory(skillAuth)

		const eventStore = this.storeFactory.Store('event', {
			apiClientFactory: async () => {
				return client
			},
		})

		await eventStore.unRegisterEvents(options)
	}

	public async clearAllSkills() {
		await this.personFixture.loginAsDemoPerson()

		const skillStore = this.storeFactory.Store('skill')
		const skills = await skillStore.fetchMySkills()

		for (const skill of skills) {
			await skillStore.unregisterSkill(skill.id)
		}

		return skills.length
	}
}
