import {
	PermissionContract,
	PermissionContractMap,
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

		const map: PermissionContractMap = {}

		for (const file of matches) {
			const contract = (await this.Service('import').importDefault(
				diskUtil.resolvePath(this.cwd, file)
			)) as PermissionContract

			map[contract.id] = contract.permissions.map((p) => p.id)
		}

		return map
	}
}
