import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { SpruceSchemas } from '@sprucelabs/mercury-types'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import PermissionStore, {
	ImportedPermission,
} from '../../../features/permission/stores/PermissionStore'
import { ApiClientFactoryOptions } from '../../../types/apiClient.types'
import { ListPermContractsTargetAndPayload } from '../../support/EventFaker'
import AbstractPermissionsTest from './support/AbstractPermissionsTest'
import generateShortAlphaId from './support/generateShortAlphaId'
import { sortPermissionContracts } from './support/sortPermissionContracts'

export default class PermissionStoreTest extends AbstractPermissionsTest {
	private static permissions: PermissionStore
	private static contractName1: string
	private static contractName2: string
	private static fqid1: string
	private static fqid2: string
	private static namespace: string

	protected static async beforeAll() {
		await super.beforeAll()
		const namespace = await this.Service('pkg').getSkillNamespace()
		this.namespace = namespace

		this.contractName1 = generateShortAlphaId()
		this.fqid1 = `${namespace}.${this.contractName1}`

		this.contractName2 = generateShortAlphaId()
		const contractId = this.contractName2
		this.fqid2 = buildPermissionContractId(contractId, namespace)
	}

	protected static async beforeEach() {
		await super.beforeEach()
		MercuryClientFactory.setIsTestMode(true)
		this.permissions = this.Store('permission')
		await this.eventFaker.fakeListPermissionContracts(() => {})
	}

	@test()
	protected static async loadsNoLocalByDefault() {
		const permissions = await this.loadLocalPermissions()
		assert.isEqualDeep(permissions, [])
	}

	@test()
	protected static async loadsOneContract() {
		await this.createPermissionContract(this.contractName1)
		await this.assertLocalPermissionsEqual([
			{
				id: this.fqid1,
				permissions: ['can-high-five'],
				path: this.resolvePath(
					`src/permissions/${this.contractName1}.permissions.ts`
				),
			},
		])
	}

	@test()
	protected static async loadsSecondContract() {
		await this.createPermissionContract(this.contractName2)

		await this.assertLocalPermissionsEqual([
			{
				id: this.fqid2,
				permissions: ['can-high-five'],
				path: this.resolvePath(
					`src/permissions/${this.contractName2}.permissions.ts`
				),
			},
			{
				id: this.fqid1,
				permissions: ['can-high-five'],
				path: this.resolvePath(
					`src/permissions/${this.contractName1}.permissions.ts`
				),
			},
		])
	}

	@test()
	protected static async mixesInAllPermissions() {
		const contractId = 'oeu-aoeuao'
		const perm1Id = 'what-the'
		const perm2Id = 'go-dogs'

		this.updateFirstContractBuilder(contractId, perm1Id, perm2Id)

		await this.assertLocalPermissionsEqual([
			{
				id: this.fqid2,
				permissions: ['can-high-five'],
				path: this.resolvePath(
					`src/permissions/${this.contractName2}.permissions.ts`
				),
			},
			{
				id: buildPermissionContractId(contractId, this.namespace),
				permissions: [perm1Id, perm2Id],
				path: this.resolvePath(
					`src/permissions/${this.contractName1}.permissions.ts`
				),
			},
		])
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
			[this.fqid2]: ['can-high-five'],
			[buildPermissionContractId('oeu-aoeuao', this.namespace)]: [
				'what-the',
				'go-dogs',
			],
		})
	}

	@test()
	protected static async connectsAsSkill() {
		let passedOptions: ApiClientFactoryOptions | undefined

		//@ts-ignore
		const old = this.permissions.connectToApi.bind(this.permissions)
		//@ts-ignore
		this.permissions.connectToApi = (options) => {
			passedOptions = options
			return old(passedOptions)
		}

		await this.fetchContracts()
		assert.isEqualDeep(passedOptions, { shouldAuthAsCurrentSkill: true })
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
		expected: ImportedPermission[]
	) {
		const perms = await this.loadLocalPermissions()

		perms.sort(sortPermissionContracts)
		expected.sort(sortPermissionContracts)

		assert.isEqualDeep(perms, expected)
	}

	private static async loadLocalPermissions() {
		//@ts-ignore
		return await this.permissions.loadLocalPermissions()
	}
}

function buildPermissionContractId(
	contractId: string,
	namespace?: string
): string {
	return `${namespace}.${contractId}`
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
