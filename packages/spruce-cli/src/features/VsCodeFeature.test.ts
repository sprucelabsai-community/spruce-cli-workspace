import path from 'path'
import { assert, test } from '@sprucelabs/test'
import fs from 'fs-extra'
import { Feature } from '#spruce/autoloaders/features'
import BaseTest from '../BaseTest'

export default class VsCodeFeatureTest extends BaseTest {
	@test('Properly detects when feature is not installed')
	protected static async notInstalled() {
		const isInstalled = await this.services.feature.isInstalled({
			features: [Feature.VSCode]
		})

		assert.isFalse(isInstalled)
	}

	@test('Can install the feature')
	protected static async installFeature() {
		await this.services.feature.install({
			features: [
				{
					feature: Feature.VSCode
				}
			]
		})

		const isInstalled = await this.services.feature.isInstalled({
			features: [Feature.VSCode]
		})

		// VSCode isn't installed in CI so we expect it to fail
		if (process.env.CI === 'true') {
			assert.isFalse(isInstalled)
		} else {
			assert.isTrue(isInstalled)
		}

		// double check exact file we'd expect
		assert.isTrue(
			fs.existsSync(path.join(this.cwd, '.vscode', 'settings.json'))
		)
	}
}
