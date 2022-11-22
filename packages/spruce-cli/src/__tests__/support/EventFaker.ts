import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { eventFaker } from '@sprucelabs/spruce-test-fixtures'

export type ListPermContractsTargetAndPayload =
	SpruceSchemas.Mercury.v2020_12_25.ListPermissionContractsEmitTargetAndPayload
export default class EventFaker {
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
}
