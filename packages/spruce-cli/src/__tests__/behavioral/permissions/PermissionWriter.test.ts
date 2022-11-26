import { PermissionContractMap } from '@sprucelabs/mercury-types'
import { test, generateId } from '@sprucelabs/test-utils'
import AbstractPermissionsTest from './support/AbstractPermissionsTest'

export default class PermissionWriterTest extends AbstractPermissionsTest {
	@test()
	protected static async writesProperContractId() {
		const contractId = generateId()
		const perm1 = generateId()
		const perm2 = generateId()

		await this.writeTypesFile({
			[contractId]: [perm1, perm2],
		})

		await this.writeTestFileAndAssertValid(contractId, perm1, perm2)
	}

	private static async writeTypesFile(map: PermissionContractMap) {
		const writer = this.writers.Writer('permission', { fileDescriptions: [] })
		await writer.writeTypesFile(this.cwd, map)
	}
}
