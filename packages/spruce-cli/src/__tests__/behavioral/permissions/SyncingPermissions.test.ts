import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { assert, test } from '@sprucelabs/test-utils'
import ActionFactory from '../../../features/ActionFactory'
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
		ExecuteTrackingAction.wasExecuteInvoked = false
		await this.eventFaker.fakeListPermissionContracts()
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

	@test()
	protected static async upgradingSyncsPermissions() {
		this.beginTrackingExecute()

		await this.emitDidExecuteUpgrade()

		assert.isTrue(ExecuteTrackingAction.wasExecuteInvoked)
	}

	@test()
	protected static async doesNotSyncIfNotInstalled() {
		this.beginTrackingExecute()
		this.featureInstaller.isInstalled = async (code) => code !== 'permission'
		await this.emitDidExecuteUpgrade()
		assert.isFalse(ExecuteTrackingAction.wasExecuteInvoked)
	}

	private static beginTrackingExecute() {
		ActionFactory.setActionClass('permission', 'sync', ExecuteTrackingAction)
	}

	private static async sync() {
		return await this.syncAction.execute()
	}

	private static async emitDidExecuteUpgrade() {
		await this.emitter.emitAndFlattenResponses('feature.did-execute', {
			actionCode: 'upgrade',
			featureCode: 'skill',
			results: {},
		})
	}
}

class ExecuteTrackingAction extends SyncAction {
	public static wasExecuteInvoked = false
	public async execute() {
		ExecuteTrackingAction.wasExecuteInvoked = true
		return {}
	}
}
