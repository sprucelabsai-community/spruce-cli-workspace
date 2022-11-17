import { test, assert, generateId } from '@sprucelabs/test-utils'
import PermissionStore, {
	PermissionContractMap,
} from '../../../features/permission/stores/PermissionStore'
import AbstractPermissionsTest from './AbstractPermissionsTest'

export default class PermissionStoreTest extends AbstractPermissionsTest {
	protected static skillCacheKey = 'permissions'
	private static permissions: PermissionStore
	private static contractName1: string
	private static contractName2: string

	protected static async beforeEach() {
		await super.beforeEach()
		this.permissions = this.Store('permission')
		this.contractName1 = generateShortAlphaId()
		this.contractName2 = generateShortAlphaId()
	}

	@test()
	protected static async loadsNoLocalByDefault() {
		const permissions = await this.loadLocalPermissions()
		assert.isEqualDeep(permissions, {})
	}

	@test()
	protected static async loadsOneContract() {
		await this.createPermissionContract(this.contractName1)
		const expected = {
			[this.contractName1]: ['can-high-five'],
		}

		await this.assertLocalPermissionsEqual(expected)
	}

	private static async assertLocalPermissionsEqual(
		expected: PermissionContractMap
	) {
		const perms = await this.loadLocalPermissions()
		assert.isEqualDeep(perms, expected)
	}

	@test()
	protected static async loadsSecondContract() {}

	private static async loadLocalPermissions() {
		return await this.permissions.loadLocalPermissions()
	}
}
function generateShortAlphaId() {
	return generateId().replace(/[0-9]/g, '').substring(0, 5)
}
