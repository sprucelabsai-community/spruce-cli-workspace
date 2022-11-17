import { test } from '@sprucelabs/test-utils'
import SyncAction from '../../../features/permission/actions/SyncAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class SyncingPermissionsTest extends AbstractSkillTest {
	protected static skillCacheKey = 'permissions'
	private static sync: SyncAction

	protected static async beforeEach() {
		await super.beforeEach()
		this.sync = this.Action('permission', 'sync')
	}

	@test()
	protected static async generatesExpectedTypesFile() {
		const results = await this.sync.execute()
		const expected = this.resolveHashSprucePath(
			`permissions/permissions.types.ts`
		)

		testUtil.assertFileByPathInGeneratedFiles(expected, results.files)
		await this.assertValidActionResponseFiles(results)
	}
}
