import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert, test } from '@sprucelabs/test-utils'
import AbstractPermissionsTest from './support/AbstractPermissionsTest'

export default class PermissionPluginTest extends AbstractPermissionsTest {
	@test()
	protected static async createsPluginWithExpectedContent() {
		const expected = this.getPluginPath()
		await this.assertFilePassesTypeChecks(expected)
	}

	@test()
	protected static async pluginIsExpectedContent() {
		const content = diskUtil.readFile(this.getPluginPath())
		assert.isEqual(
			content.trim(),
			`export { plugin as default } from '@sprucelabs/spruce-permission-plugin'`
		)
	}

	private static getPluginPath() {
		return this.resolveHashSprucePath('features', 'permission.plugin.ts')
	}
}
