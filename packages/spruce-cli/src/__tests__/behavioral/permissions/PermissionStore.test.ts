import { PermissionContractMap } from '@sprucelabs/mercury-types'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import PermissionStore from '../../../features/permission/stores/PermissionStore'
import AbstractPermissionsTest from './AbstractPermissionsTest'

export default class PermissionStoreTest extends AbstractPermissionsTest {
	protected static skillCacheKey = 'permissions'
	private static permissions: PermissionStore
	private static contractName1: string
	private static contractName2: string

	protected static async beforeAll() {
		await super.beforeAll()
		this.contractName1 = generateShortAlphaId()
		this.contractName2 = generateShortAlphaId()
	}

	protected static async beforeEach() {
		await super.beforeEach()
		this.permissions = this.Store('permission')
	}

	@test()
	protected static async loadsNoLocalByDefault() {
		const permissions = await this.loadLocalPermissions()
		assert.isEqualDeep(permissions, {})
	}

	@test()
	protected static async loadsOneContract() {
		await this.createPermissionContract(this.contractName1)
		await this.assertLocalPermissionsEqual({
			[this.contractName1]: ['can-high-five'],
		})
	}

	@test()
	protected static async loadsSecondContract() {
		await this.createPermissionContract(this.contractName2)
		await this.assertLocalPermissionsEqual({
			[this.contractName1]: ['can-high-five'],
			[this.contractName2]: ['can-high-five'],
		})
	}

	@test()
	protected static async mixesInAllPermissions() {
		const file = this.resolvePath(
			'src',
			'permissions',
			`${this.contractName1}.permissions.ts`
		)
		diskUtil.writeFile(file, contract1)

		await this.assertLocalPermissionsEqual({
			['oeu-aoeuao']: ['what-the', 'go-dogs'],
			[this.contractName2]: ['can-high-five'],
		})
	}

	private static async assertLocalPermissionsEqual(
		expected: PermissionContractMap
	) {
		const perms = await this.loadLocalPermissions()
		assert.isEqualDeep(perms, expected)
	}

	private static async loadLocalPermissions() {
		return await this.permissions.loadLocalPermissions()
	}
}
function generateShortAlphaId() {
	return generateId().replace(/[0-9]/g, '').substring(0, 5)
}

const contract1 = `import {
    buildPermissionContract
} from '@sprucelabs/mercury-types'

const debeePermissions = buildPermissionContract({
    id: 'oeu-aoeuao',
    name: 'debee',
    description: '',
    requireAllPermissions: false,
    permissions: [
        {
            id: 'what-the',
            name: 'Can give high five',
            description: 'Will this person be allowed to high five?',
            defaults: {
               skill: false,
            },
            requireAllStatuses: false,
        },
        {
            id: 'go-dogs',
            name: 'Can give high five',
            description: 'Will this person be allowed to high five?',
            defaults: {
               skill: false,
            },
            requireAllStatuses: false,
        }
    ]
})

export default debeePermissions
`
