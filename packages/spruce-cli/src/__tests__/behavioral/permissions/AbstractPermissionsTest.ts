import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import CreateAction from '../../../features/permission/actions/CreateAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

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
}
