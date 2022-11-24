import {
	PermissionContract,
	PermissionContractMap,
} from '@sprucelabs/mercury-types'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import globby from 'globby'
import AbstractStore from '../../../stores/AbstractStore'

export default class PermissionStore extends AbstractStore {
	public name = 'permission'

	private async loadLocalPermissions() {
		const matches = await globby('**/*.permissions.ts', {
			cwd: this.cwd,
		})

		const namespace = this.Service('pkg').getSkillNamespace()

		const map: PermissionContractMap = {}

		for (const file of matches) {
			const contract = (await this.Service('import').importDefault(
				diskUtil.resolvePath(this.cwd, file)
			)) as PermissionContract

			map[`${namespace}.${contract.id}`] = contract.permissions.map((p) => p.id)
		}

		return map
	}

	public async fetchContracts() {
		const client = await this.connectToApi({ shouldAuthAsCurrentSkill: true })
		const deps = this.Service('dependency').get()

		const map: PermissionContractMap = await this.loadLocalPermissions()

		const [{ permissionContracts }] = await client.emitAndFlattenResponses(
			'list-permission-contracts::v2020_12_25',
			{
				target: {
					namespaces: deps.map((d) => d.namespace),
				},
			}
		)

		for (const result of permissionContracts) {
			map[result.contract.id] = result.contract.permissions.map((p) => p.id)
		}

		return map
	}
}
