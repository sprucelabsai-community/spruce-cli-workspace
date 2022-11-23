import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { test } from '@sprucelabs/test-utils'
import SyncAction from '../../../features/permission/actions/SyncAction'
import testUtil from '../../../tests/utilities/test.utility'
import AbstractPermissionsTest from './AbstractPermissionsTest'
import generateShortAlphaId from './generateShortAlphaId'

export default class SyncingPermissionsTest extends AbstractPermissionsTest {
	private static syncAction: SyncAction

	protected static async beforeEach() {
		await super.beforeEach()
		this.syncAction = this.Action('permission', 'sync')
		MercuryClientFactory.setIsTestMode(true)
	}

	@test()
	protected static async generatesExpectedTypesFile() {
		const results = await this.sync()
		const expected = this.resolveHashSprucePath(
			`permissions/permissions.types.ts`
		)

		testUtil.assertFileByPathInGeneratedFiles(expected, results.files)
	}

	@test()
	protected static async syncsNewPermissionsWhenMade() {
		const id = generateShortAlphaId()
		await this.createPermissionContract(id)
		await this.writeTestFileAndAssertValid(id)
	}

	private static async sync() {
		return await this.syncAction.execute()
	}
}
