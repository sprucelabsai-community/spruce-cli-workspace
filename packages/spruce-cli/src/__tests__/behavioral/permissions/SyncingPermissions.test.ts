import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert, test } from '@sprucelabs/test-utils'
import ActionFactory from '../../../features/ActionFactory'
import SyncAction from '../../../features/permission/actions/SyncAction'
import testUtil from '../../../tests/utilities/test.utility'
import AbstractPermissionsTest from './support/AbstractPermissionsTest'
import generateShortAlphaId from './support/generateShortAlphaId'
import { sortPermissionContracts } from './support/sortPermissionContracts'

export default class SyncingPermissionsTest extends AbstractPermissionsTest {
	private static syncAction: SyncAction
	private static contractId1: string
	private static contractId2: string

	protected static async beforeAll() {
		await super.beforeAll()
		this.contractId1 = generateShortAlphaId()
		this.contractId2 = generateShortAlphaId()
	}

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
		await this.createPermissionContract(this.contractId1)
		await this.writeTestFileAndAssertValid(
			`testing-permissions.${this.contractId1}`
		)
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

	@test()
	protected static async generatesCombinedFile() {
		assert.isTrue(diskUtil.doesFileExist(this.getCombinedPath()))
	}

	@test()
	protected static async combinedFileImportsAllPermissions() {
		await this.createPermissionContract(this.contractId2)

		const imported = await this.Service('import').importDefault(
			this.getCombinedPath()
		)

		assert.isEqualDeep(
			imported.sort(sortPermissionContracts),
			[
				{
					id: this.contractId1,
					name: this.contractId1,
					description: '',
					requireAllPermissions: false,
					permissions: [
						{
							id: 'can-high-five',
							name: 'Can give high five',
							description: 'Will this person be allowed to high five?',
							defaults: { skill: false },
							requireAllStatuses: false,
						},
					],
				},
				{
					id: this.contractId2,
					name: this.contractId2,
					description: '',
					requireAllPermissions: false,
					permissions: [
						{
							id: 'can-high-five',
							name: 'Can give high five',
							description: 'Will this person be allowed to high five?',
							defaults: { skill: false },
							requireAllStatuses: false,
						},
					],
				},
			].sort(sortPermissionContracts)
		)
	}

	private static getCombinedPath() {
		return this.resolveHashSprucePath('permissions', 'permissions.ts')
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
