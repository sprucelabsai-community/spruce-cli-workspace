import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import AbstractStore from '../../../stores/AbstractStore'

export default class OrganizationStore extends AbstractStore {
    public name = 'organization'

    public async isSkillInstalledAtOrg(skillId: string, orgId: string) {
        const client = await this.connectToApi()
        const results = await client.emit('is-skill-installed::v2020_12_25', {
            target: {
                organizationId: orgId,
            },
            payload: {
                skillId,
            },
        })

        const { isInstalled } =
            eventResponseUtil.getFirstResponseOrThrow(results)

        return isInstalled
    }

    public async installSkillAtOrganization(
        skillId: string,
        orgId: any
    ): Promise<void> {
        const client = await this.connectToApi()

        const results = await client.emit('install-skill::v2020_12_25', {
            target: {
                organizationId: orgId,
            },
            payload: {
                skillId,
            },
        })

        eventResponseUtil.getFirstResponseOrThrow(results)
    }

    public async fetchMyOrganizations() {
        const client = await this.connectToApi()
        const results = await client.emit('list-organizations::v2020_12_25', {
            payload: {
                shouldOnlyShowMine: true,
            },
        })

        const { organizations } =
            eventResponseUtil.getFirstResponseOrThrow(results)

        return organizations
    }

    public async create(values: { name: string; slug?: string }) {
        const { name, slug } = values
        debugger
        const client = await this.connectToApi()

        const results = await client.emit('create-organization::v2020_12_25', {
            payload: {
                name,
                slug,
            },
        })

        const { organization } =
            eventResponseUtil.getFirstResponseOrThrow(results)

        return organization
    }

    public async deleteOrganization(orgId: string) {
        const client = await this.connectToApi()

        const results = await client.emit('delete-organization::v2020_12_25', {
            target: {
                organizationId: orgId,
            },
        })

        eventResponseUtil.getFirstResponseOrThrow(results)
    }
}
