import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import AbstractErrorTest from '../../../tests/AbstractErrorTest'

export default class SettingUpErrorTest extends AbstractErrorTest {
	@test()
	protected static async failsIfSkillIsNotInstalled() {
		const fixture = this.FeatureFixture()
		const err = await assert.doesThrowAsync(() =>
			fixture.installFeatures([
				{
					code: 'error',
				},
			])
		)

		errorAssert.assertError(err, 'VALIDATION_FAILED')
	}

	@test()
	protected static async installsSchemasIfNotInstalled() {
		await this.installErrorFeature('errors')

		const installer = this.featureInstaller

		const isSchemaInstalled = await installer.isInstalled('schema')
		assert.isTrue(isSchemaInstalled)

		const isErrorInstalled = await installer.isInstalled('error')
		assert.isTrue(isErrorInstalled)
	}
}
