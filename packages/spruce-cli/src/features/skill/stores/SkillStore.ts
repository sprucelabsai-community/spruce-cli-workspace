import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore from '../../../stores/AbstractStore'
import { CurrentSkill, RegisteredSkill } from '../../../types/cli.types'

export interface CreateSkill {
	name: string
	slug: string
	description?: string
}

export interface RegisterSkillOptions {
	isRegisteringCurrentSkill: boolean
}

export default class SkillStore extends AbstractStore {
	public readonly name = 'skill'
	private static currentSkill?: CurrentSkill

	public static clearCurrentSkill() {
		this.currentSkill = undefined
	}

	public async register(
		values: CreateSkill,
		options?: RegisterSkillOptions
	): Promise<RegisteredSkill> {
		const isRegisteringCurrentSkill =
			options?.isRegisteringCurrentSkill !== false

		isRegisteringCurrentSkill && this.assertInSkill()

		const { name, slug, description } = values
		const client = await this.connectToApi()

		const results = await client.emit('register-skill::v2020_12_25', {
			payload: {
				name,
				slug,
				description,
			},
		})

		const { skill } = eventResponseUtil.getFirstResponseOrThrow(results)

		if (isRegisteringCurrentSkill) {
			await this.setCurrentSkillsNamespace(skill.slug)
			this.Service('auth').updateCurrentSkill(skill)
		}

		return skill
	}

	private assertInSkill() {
		const isInstalled = this.Service('settings').isMarkedAsInstalled('skill')

		if (!isInstalled) {
			throw new SpruceError({ code: 'DIRECTORY_NOT_SKILL' })
		}
	}

	public async loadCurrentSkill(): Promise<CurrentSkill> {
		if (SkillStore.currentSkill) {
			return SkillStore.currentSkill
		}

		this.assertInSkill()

		const currentSkill = this.Service('auth').getCurrentSkill()

		if (currentSkill) {
			const client = await this.connectToApi({ shouldAuthAsCurrentSkill: true })
			const response = await client.emit('get-skill::v2020_12_25', {
				target: {
					skillId: currentSkill.id,
				},
			})

			const { skill } = eventResponseUtil.getFirstResponseOrThrow(response)

			SkillStore.currentSkill = {
				...skill,
				namespacePascal: namesUtil.toPascal(skill.slug),
				isRegistered: true,
				apiKey: currentSkill.apiKey,
			}
			return SkillStore.currentSkill as CurrentSkill
		}

		return {
			name: this.getNamespaceFromPkg(),
			namespacePascal: this.getEventNamespaceForNotRegistered(),
			description: this.getSkillDescriptionFromPkg(),
			isRegistered: false,
		}
	}

	public async isCurrentSkillRegistered() {
		const skill = await this.loadCurrentSkill()
		return skill.isRegistered
	}

	private getNamespaceFromPkg() {
		const pkg = this.Service('pkg')
		const nameFromPackage = pkg.get('skill.namespace')
		if (!nameFromPackage) {
			throw new Error(
				'You need need to set skill.namespace in the package.json'
			)
		}
		return nameFromPackage
	}

	public async loadCurrentSkillsNamespace() {
		const fallback = namesUtil.toPascal(this.getNamespaceFromPkg())

		if (this.Service('auth').getCurrentSkill()) {
			const current = await this.loadCurrentSkill()
			return namesUtil.toPascal(current.slug ?? fallback)
		}

		return fallback
	}

	public async setCurrentSkillsNamespace(namespace: string) {
		let isRegistered = false
		try {
			isRegistered = await this.isCurrentSkillRegistered()
			// eslint-disable-next-line no-empty
		} catch {}

		if (isRegistered) {
			throw new SpruceError({
				code: 'GENERIC',
				friendlyMessage: `You can't change the namespace of a skill that is registered.`,
			})
		}

		const pkg = this.Service('pkg')
		pkg.set({ path: 'skill.namespace', value: namesUtil.toKebab(namespace) })
	}

	private getEventNamespaceForNotRegistered() {
		return namesUtil.toPascal(this.getNamespaceFromPkg())
	}

	private getSkillDescriptionFromPkg() {
		const pkg = this.Service('pkg')
		return pkg.get('description')
	}

	public async unregisterSkill(skillId: string) {
		const client = await this.connectToApi()

		const response = await client.emit('unregister-skill::v2020_12_25', {
			target: {
				skillId,
			},
		})

		eventResponseUtil.getFirstResponseOrThrow(response)
	}

	public async fetchMySkills() {
		const client = await this.connectToApi()

		const response = await client.emit('list-skills::v2020_12_25', {
			payload: {
				showMineOnly: true,
			},
		})

		const { skills } = eventResponseUtil.getFirstResponseOrThrow(response)

		return skills
	}
}
