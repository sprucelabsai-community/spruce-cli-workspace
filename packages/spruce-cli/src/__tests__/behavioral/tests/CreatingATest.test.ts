import { test, assert } from '@sprucelabs/test'
import AbstractTestTest from '../../../tests/AbstractTestTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingBehavioralTestsTest extends AbstractTestTest {
	@test()
	protected static async hasCreateAction() {
		assert.isFunction(this.Action('test', 'create').execute)
	}

	@test()
	protected static async doesNotAskAboutFixturesWhenInNodeModule() {
		await this.installTests('testsInNodeModule')

		const results = await this.Action('test', 'create').execute({
			type: 'behavioral',
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
			namePascal: 'CanBookAppointment',
		})

		assert.isFalsy(results.errors)
	}

	@test()
	protected static async asksAboutSpruceFixturesWhenCreatingIfSkillFeatureIsInstalled() {
		await this.installTests()
		const promise = this.Action('test', 'create').execute({
			type: 'behavioral',
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
			namePascal: 'CanBookAppointment',
		})

		await this.waitForInput()
		this.selectOptionBasedOnLabel('AbstractSpruceFixtureTest')

		await promise
	}

	@test()
	protected static async canCreateBehavioralTest() {
		await this.installTests()
		const promise = this.Action('test', 'create').execute({
			type: 'behavioral',
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
			namePascal: 'CanBookAppointment',
		})

		await this.waitForInput()
		this.selectOptionBasedOnLabel('AbstractSpruceFixtureTest')

		const response = await promise

		const match = testUtil.assertsFileByNameInGeneratedFiles(
			'CanBookAppointment.test.ts',
			response.files
		)

		assert.doesInclude(match, 'behavioral')

		await this.Service('build').build()

		await assert.doesThrowAsync(
			() => this.Service('command').execute('yarn test'),
			/false.*?does not equal.*?true/gis
		)
	}
}
