import pathUtil from 'path'
import { diskUtil, versionUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../tests/AbstractCliTest'
import testUtil from '../../tests/utilities/test.utility'

export default class UpgradingWithSandboxFeatureInstalledTest extends AbstractCliTest {
	protected static async beforeEach() {
		await super.beforeEach()
		await this.FeatureFixture().installCachedFeatures('sandbox')
		await this.listenToDidInstallInthePast()
	}

	@test()
	protected static async doesNotAskForVersionWhenSettingUpSandboxWithCoreListener() {
		await this.setup()
	}

	@test()
	protected static async usesTodaysVersionEvenWithCoreListene() {
		const match = await this.setupAndGetListenerPath()

		const fileName = pathUtil.basename(match)
		const expected = `will-boot.${
			versionUtil.generateVersion().dirValue
		}.listener.ts`
		assert.isEqual(fileName, expected)
	}

	@test()
	protected static async overwritesExistingWillBoot() {
		const expected = `will-boot.v2010_01_10.listener.ts`

		const match = await this.setupAndGetListenerPath()

		diskUtil.deleteFile(match)
		diskUtil.writeFile(
			this.resolvePath(pathUtil.dirname(match), expected),
			'export default async () => {}'
		)

		const syncResults = await this.Action('event', 'syncListeners').execute({})
		assert.isFalsy(syncResults.errors)

		const secondMatch = await this.setupAndGetListenerPath()
		const name = pathUtil.basename(secondMatch)

		assert.isEqual(name, expected)
	}

	private static async setupAndGetListenerPath() {
		const results = await this.setup()
		const match = testUtil.assertFileByNameInGeneratedFiles(
			/will-boot/gi,
			results.files
		)
		return match
	}

	private static async setup() {
		const results = await this.Action('sandbox', 'setup').execute({})
		assert.isFalsy(results.errors)
		return results
	}

	private static async listenToDidInstallInthePast() {
		const results = await this.Action('event', 'listen').execute({
			namespace: 'mercury',
			eventName: 'did-install::v2020_12_25',
		})

		assert.isFalsy(results.errors)
	}
}
