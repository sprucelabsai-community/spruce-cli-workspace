import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore, { StoreOptions } from '../../../stores/AbstractStore'
import { CurrentSkill, RegisteredSkill } from '../../../types/cli.types'

export default class SkillStore extends AbstractStore {
    public readonly name = 'skill'
    private static currentSkill?: CurrentSkill

    public constructor(options: StoreOptions<SkillStoreOptions>) {
        super(options)
    }

    public static clearCurrentSkill() {
        this.currentSkill = undefined
    }

    public async register(
        values: CreateSkill,
        options?: RegisterSkillOptions
    ): Promise<RegisteredSkill> {
        const isRegisteringCurrentSkill =
            options?.isRegisteringCurrentSkill !== false

        isRegisteringCurrentSkill && (await this.assertInSkill())

        const { name, slug, description, isPublished } = values
        const client = await this.connectToApi()

        const results = await client.emit('register-skill::v2020_12_25', {
            payload: {
                name,
                slug,
                description,
                isPublished,
            },
        })

        const { skill } = eventResponseUtil.getFirstResponseOrThrow(results)

        if (isRegisteringCurrentSkill) {
            await this.setCurrentSkillsNamespace(skill.slug)
            this.Service('auth').updateCurrentSkill(skill)
        }

        return skill
    }

    private async assertInSkill() {
        const isInstalled =
            this.Service('settings').isMarkedAsInstalled('skill')

        if (!isInstalled) {
            throw new SpruceError({ code: 'DIRECTORY_NOT_SKILL' })
        }
    }

    public async loadCurrentSkill(): Promise<CurrentSkill> {
        if (SkillStore.currentSkill) {
            return SkillStore.currentSkill
        }

        await this.assertInSkill()

        const currentSkill = this.Service('auth').getCurrentSkill()

        if (currentSkill) {
            const client = await this.connectToApi({
                shouldAuthAsCurrentSkill: true,
            })

            const response = await client.emit('get-skill::v2020_12_25', {
                target: {
                    skillId: currentSkill.id,
                },
            })

            const { skill } =
                eventResponseUtil.getFirstResponseOrThrow(response)

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
        const nameFromPackage = this.Service('pkg').getSkillNamespace()
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
        } catch {}

        if (isRegistered) {
            throw new SpruceError({
                code: 'GENERIC',
                friendlyMessage: `You can't set the namespace of a skill that is registered.`,
            })
        }

        this.Service('auth').updateCurrentSkillNamespace(namespace)
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

        if (SkillStore.currentSkill?.id === skillId) {
            SkillStore.currentSkill = undefined
            this.Service('auth').logoutCurrentSkill()
        }
    }

    public async fetchMySkills() {
        return this.fetchAllSkills({ shouldOnlyShowMine: true })
    }

    public async fetchAllSkills(query?: {
        shouldOnlyShowMine?: boolean
        namespaces?: string[]
    }) {
        const client = await this.connectToApi()

        const [{ skills }] = await client.emitAndFlattenResponses(
            'list-skills::v2020_12_25',
            {
                payload: {
                    ...query,
                },
            }
        )

        return skills
    }
}

export interface CreateSkill {
    name: string
    slug?: string
    description?: string
    isPublished?: boolean
}

export interface RegisterSkillOptions {
    isRegisteringCurrentSkill?: boolean
}

export interface SkillStoreOptions {}
