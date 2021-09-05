import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class SettingUpANodeModuleTest extends AbstractCliTest {
	@test()
	protected static async settingUpANodeModule() {
		const cli = await this.Cli()
		const err = await assert.doesThrowAsync(() =>
			cli.installFeatures({
				features: [
					{
						code: 'node',
						//@ts-ignore
						options: {},
					},
				],
			})
		)

		errorAssertUtil.assertError(err, 'VALIDATION_FAILED')
	}

	@test()
	protected static async canTellIfNotInstalled() {
		const installer = this.getFeatureInstaller()
		const isInstalled = await installer.isInstalled('node')
		assert.isFalse(isInstalled)
	}

	@test()
	protected static async installsNodeModuleWithCleanedUpPackageJson() {
		const cli = await this.Cli()

		await cli.installFeatures({
			features: [
				{
					code: 'node',
					options: {
						name: 'Test module',
						description: 'so great!',
					},
				},
			],
		})

		const pkgService = this.Service('pkg')
		const contents = pkgService.readPackage()

		assert.doesInclude(contents, {
			name: 'test-module',
			description: 'so great!',
			version: '0.0.1',
		})
	}
}
