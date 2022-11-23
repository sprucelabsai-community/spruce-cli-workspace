import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import CreateAction from '../../../features/permission/actions/CreateAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import renderPermissionTestFile from './renderPermissionTestFile'

export default abstract class AbstractPermissionsTest extends AbstractSkillTest {
	protected static skillCacheKey = 'permissions'
	protected static createAction: CreateAction

	protected static async beforeEach() {
		await super.beforeEach()
		this.createAction = this.Action('permission', 'create')
	}

	protected static async createPermissionContract(nameReadable: string) {
		return await this.createAction.execute({
			nameReadable,
			nameCamel: namesUtil.toCamel(nameReadable),
		})
	}

	protected static async writeTestFileAndAssertValid(
		contractId: string,
		perm1?: string,
		perm2?: string
	) {
		const contents = renderPermissionTestFile(contractId, perm1, perm2)
		const destination = this.resolvePath('src', 'test.ts')
		diskUtil.writeFile(destination, contents)

		await this.assertFilePassesTypeChecks(destination)

		return destination
	}
}
