import { SpruceSchemas } from '@sprucelabs/spruce-core-schemas'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../../../errors/SpruceError'
import AbstractStore, { StoreOptions } from '../../../stores/AbstractStore'
import { CurrentSkill, RegisteredSkill } from '../../../types/cli.types'

export default class SkillStoreImpl
    extends AbstractStore
    implements SkillStore
{
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

        isRegisteringCurrentSkill && this.assertInSkill()

        const { name, slug, description, isPublished } = values
        const client = await this.connectToApi()

        const [{ skill }] = await client.emitAndFlattenResponses(
            'register-skill::v2020_12_25',
            {
                payload: {
                    name,
                    slug,
                    description,
                    isPublished,
                },
            }
        )

        if (isRegisteringCurrentSkill) {
            await this.setCurrentSkillsNamespace(skill.slug)
            this.Service('auth').updateCurrentSkill(skill)
        }

        return skill
    }

    private assertInSkill() {
        const isInstalled =
            this.Service('settings').isMarkedAsInstalled('skill')

        if (!isInstalled) {
            throw new SpruceError({ code: 'DIRECTORY_NOT_SKILL' })
        }
    }

    public async loadCurrentSkill(): Promise<CurrentSkill> {
        if (SkillStoreImpl.currentSkill) {
            return SkillStoreImpl.currentSkill
        }

        this.assertInSkill()

        const currentSkill = this.Service('auth').getCurrentSkill()

        if (currentSkill) {
            const client = await this.connectToApi({
                shouldAuthAsCurrentSkill: true,
            })

            const [{ skill }] = await client.emitAndFlattenResponses(
                'get-skill::v2020_12_25',
                {
                    target: {
                        skillId: currentSkill.id,
                    },
                }
            )

            SkillStoreImpl.currentSkill = {
                ...skill,
                namespacePascal: namesUtil.toPascal(skill.slug),
                isRegistered: true,
                apiKey: currentSkill.apiKey,
            }

            return SkillStoreImpl.currentSkill as CurrentSkill
        }

        return {
            name: this.getNamespaceFromPkg(),
            namespacePascal: this.getEventNamespaceForNotRegistered(),
            description: this.getSkillDescriptionFromPkg(),
            isRegistered: false,
        }
    }

    public async publish(options?: PublishOptions) {
        const { isInstallable = true } = options || {}
        const skill = await this.loadCurrentSkill()
        if (!skill.id) {
            throw new SpruceError({
                code: 'NO_SKILLS_REGISTERED',
                friendlyMessage:
                    'You need to register your skill before you can publish it. Run `spruce register` to get started.',
            })
        }

        const client = await this.connectToApi()
        await client.emitAndFlattenResponses('publish-skill::v2020_12_25', {
            target: {
                skillId: skill.id,
            },
            payload: {
                canBeInstalled: isInstallable,
            },
        })

        delete SkillStoreImpl.currentSkill
    }

    public async isCurrentSkillRegistered() {
        const skill = await this.loadCurrentSkill()
        return skill.isRegistered
    }

    private getNamespaceFromPkg() {
        if (this.isGoModule()) {
            const goModFile = diskUtil.resolvePath(this.cwd, 'go.mod')
            const goModContents = diskUtil.readFile(goModFile)
            const moduleLine = goModContents.match(/module\s+([^\s]+)/)
            const moduleParts = moduleLine?.[1].split('/') ?? []
            return moduleParts.pop() as string
        }

        const nameFromPackage = this.Service('pkg').getSkillNamespace()
        if (!nameFromPackage) {
            throw new Error(
                'You need need to set skill.namespace in the package.json'
            )
        }
        return nameFromPackage as string
    }

    private isGoModule() {
        return diskUtil.detectProjectLanguage(this.cwd) === 'go'
    }

    public async loadCurrentSkillsNamespace() {
        const fallback = this.getNamespaceFromPkg()

        if (!this.isGoModule() && this.Service('auth').getCurrentSkill()) {
            const current = await this.loadCurrentSkill()
            return namesUtil.toPascal(current.slug ?? fallback)
        }

        return namesUtil.toPascal(fallback)
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

    public async unregisterSkill(skillId?: string) {
        const client = await this.connectToApi()
        let resolvedSkillId = skillId
        if (!skillId) {
            const currentSkill = this.Service('auth').getCurrentSkill()
            resolvedSkillId = currentSkill?.id
        }

        await client.emitAndFlattenResponses('unregister-skill::v2020_12_25', {
            target: {
                skillId: resolvedSkillId!,
            },
        })

        if (!skillId || SkillStoreImpl.currentSkill?.id === skillId) {
            SkillStoreImpl.currentSkill = undefined
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

export interface SkillStore {
    name: 'skill'
    register(
        values: CreateSkill,
        options?: RegisterSkillOptions
    ): Promise<RegisteredSkill>
    loadCurrentSkill(): Promise<CurrentSkill>
    isCurrentSkillRegistered(): Promise<boolean>
    setCurrentSkillsNamespace(namespace: string): Promise<void>
    fetchMySkills(): Promise<ListSkill[]>
    fetchAllSkills(query?: {
        shouldOnlyShowMine?: boolean
        namespaces?: string[]
    }): Promise<ListSkill[]>
    unregisterSkill(skillId?: string): Promise<void>
    publish(options?: { isInstallable?: boolean }): Promise<void>
}

type ListSkill = SpruceSchemas.Mercury.v2020_12_25.ListSkillsSkill

export interface PublishOptions {
    isInstallable?: boolean
}
