import {
	PermissionContract,
	PermissionContractMap,
	SpruceSchemas,
} from '@sprucelabs/mercury-types'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import globby from 'globby'
import AbstractStore from '../../../stores/AbstractStore'

export default class PermissionStore extends AbstractStore {
	public name = 'permission'

	public async loadLocalPermissions() {
		const matches = await globby('**/*.permissions.ts', {
			cwd: this.cwd,
		})

		const namespace = this.Service('pkg').getSkillNamespace()
		const imported: ImportedPermission[] = []

		for (const file of matches) {
			const path = diskUtil.resolvePath(this.cwd, file)
			const contract = (await this.Service('import').importDefault(
				path
			)) as PermissionContract

			imported.push({
				id: `${namespace}.${contract.id}`,
				permissions: contract.permissions.map((p) => p.id),
				path,
			})
		}

		return imported
	}

	public async fetchContracts(options?: {
		shouldSyncCorePermissions?: boolean
	}) {
		let target: ListPermContractsTargetAndPayload['target']
		const client = await this.connectToApi({ shouldAuthAsCurrentSkill: true })

		if (!options?.shouldSyncCorePermissions) {
			const deps = this.Service('dependency').get()

			target = {
				namespaces: deps.map((d) => d.namespace),
			}
		}

		const [{ permissionContracts }] = await client.emitAndFlattenResponses(
			'list-permission-contracts::v2020_12_25',
			{
				target,
			}
		)

		const local = await this.loadLocalPermissions()
		const map: PermissionContractMap = local.reduce<PermissionContractMap>(
			(map, local) => {
				map[local.id] = local.permissions
				return map
			},
			{} as any
		)

		for (const result of permissionContracts) {
			map[result.contract.id] = result.contract.permissions.map((p) => p.id)
		}

		return map
	}
}

export interface ImportedPermission {
	id: string
	permissions: string[]
	path: string
}

export type ListPermContractsTargetAndPayload =
	SpruceSchemas.Mercury.v2020_12_25.ListPermissionContractsEmitTargetAndPayload
