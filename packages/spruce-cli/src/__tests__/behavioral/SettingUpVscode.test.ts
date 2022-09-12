import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../tests/AbstractCliTest'
import testUtil from '../../tests/utilities/test.utility'

export default class SettingUpVscodeTest extends AbstractCliTest {
	@test()
	protected static async hasSetupAction() {
		assert.isFunction(this.Action('vscode', 'setup').execute)
	}

	@test.skip('Cant run on machine without vscode installed')
	protected static async settingUpAsksAboutExtensonsAndSetsUpDebug() {
		await this.FeatureFixture().installCachedFeatures('skills')
		const promise = this.Action('vscode', 'setup').execute({})

		await this.waitForInput()

		assert.isEqualDeep(this.ui.getLastInvocation(), {
			command: 'confirm',
			options: 'Want me to setup debugging for you?',
		})

		await this.ui.sendInput('y')

		await this.waitForInput()

		assert.isEqualDeep(this.ui.getLastInvocation(), {
			command: 'confirm',
			options:
				'Want me to setup vscode settings for building, testing and linting on save?',
		})

		await this.ui.sendInput('y')

		await this.waitForInput()

		assert.isEqualDeep(this.ui.getLastInvocation(), {
			command: 'confirm',
			options: 'Want me to setup tasks for building and testing?',
		})

		await this.ui.sendInput('y')

		const results = await promise

		assert.isFalsy(results.errors)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'launch.json',
			results.files ?? []
		)

		assert.isEqual(match, this.resolvePath('.vscode/launch.json'))
	}
}
