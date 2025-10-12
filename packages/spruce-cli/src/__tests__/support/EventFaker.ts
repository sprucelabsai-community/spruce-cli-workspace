import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { eventFaker } from '@sprucelabs/spruce-test-fixtures'
import { generateId } from '@sprucelabs/test-utils'
import { ListPermContractsTargetAndPayload } from '../../features/permission/stores/PermissionStore'

export default class EventFaker {
    public async fakeListSkills(cb?: () => void | ListSkill[]) {
        await eventFaker.on('list-skills::v2020_12_25', () => {
            return {
                skills: cb?.() ?? [],
            }
        })
    }

    public async fakeListPermissionContracts(
        cb?: (
            targetAndPayload: ListPermContractsTargetAndPayload
        ) =>
            | void
            | SpruceSchemas.Mercury.v2020_12_25.ListPermissionContractsResponsePayload['permissionContracts']
    ) {
        await eventFaker.on(
            'list-permission-contracts::v2020_12_25',
            (targetAndPayload) => {
                return {
                    permissionContracts: cb?.(targetAndPayload) ?? [],
                }
            }
        )
    }

    public async fakeRequestPin() {
        await eventFaker.on('request-pin::v2020_12_25', () => {
            return {
                challenge: generateId(),
            }
        })
    }

    public async fakeConfirmPin() {
        await eventFaker.on('confirm-pin::v2020_12_25', () => {
            return {
                token: generateId(),
                person: {
                    id: generateId(),
                    casualName: generateId(),
                    dateCreated: 0,
                },
            }
        })
    }
}

export type ListSkill = SpruceSchemas.Mercury.v2020_12_25.ListSkillsSkill
