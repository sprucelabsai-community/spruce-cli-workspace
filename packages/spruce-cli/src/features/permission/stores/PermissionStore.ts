import path from 'path'
import globby from 'globby'
import AbstractStore from '../../../stores/AbstractStore'

export default class PermissionStore extends AbstractStore {
	public name = 'permission'

	public async loadLocalPermissions() {
		const matches = await globby('**/*.permissions.ts', {
			cwd: this.cwd,
		})

		const contract = matches[0]
		if (contract) {
			const name = path.basename(contract).split('.').shift()!
			return {
				[name]: ['can-high-five'],
			}
		}

		return {}
	}
}

export interface PermissionContractMap {
	[contractName: string]: string[]
}
