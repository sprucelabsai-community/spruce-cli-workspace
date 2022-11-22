import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { PermissionContractMap, SpruceSchemas } from '@sprucelabs/mercury-types'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import PermissionStore from '../../../features/permission/stores/PermissionStore'
import EventFaker, {
	ListPermContractsTargetAndPayload,
} from '../../support/EventFaker'
import AbstractPermissionsTest from './AbstractPermissionsTest'

export default class PermissionStoreTest extends AbstractPermissionsTest {
	protected static skillCacheKey = 'permissions'
	private static permissions: PermissionStore
	private static contractName1: string
	private static contractName2: string
	private static eventFaker: EventFaker

	protected static async beforeAll() {
		await super.beforeAll()
		this.contractName1 = generateShortAlphaId()
		this.contractName2 = generateShortAlphaId()
	}

	protected static async beforeEach() {
		await super.beforeEach()
		MercuryClientFactory.setIsTestMode(true)
		this.permissions = this.Store('permission')
		this.eventFaker = new EventFaker()
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
		const contractId = 'oeu-aoeuao'
		const perm1Id = 'what-the'
		const perm2Id = 'go-dogs'

		this.updateFirstContractBuilder(contractId, perm1Id, perm2Id)

		await this.assertLocalPermissionsEqual({
			[contractId]: [perm1Id, perm2Id],
			[this.contractName2]: ['can-high-five'],
		})
	}

	@test()
	protected static async remotePermsEmitsListContracts() {
		let wasHit = false

		await this.eventFaker.fakeListPermissionContracts(() => {
			wasHit = true
		})

		await PermissionStoreTest.fetchContracts()
		assert.isTrue(wasHit)
	}

	@test()
	protected static async passesThroughDependentSkills() {
		const namespace = this.addRandomDependency()

		let passedTarget: ListPermContractsTargetAndPayload['target']

		await this.eventFaker.fakeListPermissionContracts(({ target }) => {
			passedTarget = target
		})

		await this.fetchContracts()

		assert.isEqualDeep(passedTarget, {
			namespaces: [namespace],
		})
	}

	@test()
	protected static async returnsDependencyMapFromRemoteContracts() {
		const perm = this.generatePermValues()
		const perm2 = this.generatePermValues()
		const perm3 = this.generatePermValues()

		const { contract, contractId } = this.generateContractRowValues([
			perm,
			perm2,
		])

		const { contract: contract2, contractId: contractId2 } =
			this.generateContractRowValues([perm3])

		await this.eventFaker.fakeListPermissionContracts(() => {
			return [contract, contract2]
		})

		const map = await this.fetchContracts()
		assert.isEqualDeep(map, {
			[contractId]: [perm.id, perm2.id],
			[contractId2]: [perm3.id],
			[this.contractName2]: ['can-high-five'],
			'oeu-aoeuao': ['what-the', 'go-dogs'],
		})
	}

	private static updateFirstContractBuilder(
		contractId: string,
		perm1Id: string,
		perm2Id: string
	) {
		const file = this.resolvePath(
			'src',
			'permissions',
			`${this.contractName1}.permissions.ts`
		)
		diskUtil.writeFile(
			file,
			generateContractBuilder(contractId, perm1Id, perm2Id)
		)
	}

	private static generateContractRowValues(
		permissions: SpruceSchemas.Mercury.v2020_12_25.Permission[]
	) {
		const contractId = generateId()
		const contract = {
			id: generateId(),
			contract: {
				id: contractId,
				name: generateId(),
				permissions,
			},
		}
		return { contract, contractId }
	}

	private static generatePermValues() {
		const permissionId = generateId()
		const perm = {
			id: permissionId,
			name: generateId(),
			defaults: {},
		}
		return perm
	}

	private static addRandomDependency() {
		const dep = this.Service('dependency')
		const namespace = generateId()
		dep.add({
			id: generateId(),
			namespace,
		})
		return namespace
	}

	private static async fetchContracts() {
		return this.permissions.fetchContracts()
	}

	private static async assertLocalPermissionsEqual(
		expected: PermissionContractMap
	) {
		const perms = await this.loadLocalPermissions()
		assert.isEqualDeep(perms, expected)
	}

	private static async loadLocalPermissions() {
		//@ts-ignore
		return await this.permissions.loadLocalPermissions()
	}
}
function generateShortAlphaId() {
	return generateId().replace(/[0-9]/g, '').substring(0, 5)
}

function generateContractBuilder(
	contractId = 'oeu-aoeuao',
	perm1Id = 'what-the',
	perm2Id = 'go-dogs'
) {
	return `import {
    buildPermissionContract
} from '@sprucelabs/mercury-types'

const debeePermissions = buildPermissionContract({
    id: '${contractId}',
    name: 'debee',
    description: '',
    requireAllPermissions: false,
    permissions: [
        {
            id: '${perm1Id}',
            name: 'Can give high five',
            description: 'Will this person be allowed to high five?',
            defaults: {
               skill: false,
            },
            requireAllStatuses: false,
        },
        {
            id: '${perm2Id}',
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
}
