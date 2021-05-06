import { test, assert } from '@sprucelabs/test'
import AbstractTestTest from '../../../tests/AbstractTestTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingBehavioralTestsTest extends AbstractTestTest {
	@test()
	protected static async hasCreateAction() {
		const cli = await this.Cli()
		assert.isFunction(cli.getFeature('test').Action('create').execute)
	}

	@test()
	protected static async doesNotAskAboutFixturesWhenInNodeModule() {
		const cli = await this.installTests('testsInNodeModule')

		const results = await cli.getFeature('test').Action('create').execute({
			type: 'behavioral',
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
			namePascal: 'CanBookAppointment',
		})

		assert.isFalsy(results.errors)
	}

	@test()
	protected static async asksAboutSpruceFixturesWhenCreatingIfSkillFeatureIsInstalled() {
		const cli = await this.installTests()
		const promise = cli.getFeature('test').Action('create').execute({
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
		const cli = await this.installTests()
		const promise = cli.getFeature('test').Action('create').execute({
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