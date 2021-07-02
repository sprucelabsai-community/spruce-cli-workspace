import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import testUtil from '../../tests/utilities/test.utility'

export default class TestingDataStoresTest extends AbstractSkillTest {
	protected static skillCacheKey = 'storesWithTests'

	@test()
	protected static async cantSelectAbstractStoreIfStoreFeatureNotInstalled() {
		const storeFeature = this.cli.getFeature('store')

		storeFeature.isInstalled = async () => false

		void this.Action('test', 'create').execute({
			type: 'behavioral',
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
			namePascal: 'CanBookAppointment',
		})

		await this.waitForInput()

		const last = this.ui.lastInvocation()
		assert.isTruthy(last.options.options.choices)
		assert.doesInclude(last.options.options.choices, {
			label: 'AbstractStoreTest (requires install)',
		})

		this.ui.reset()
	}

	@test()
	protected static async letsYouSelectAbstractStoreTest() {
		this.cli.getFeature('store').isInstalled = async () => true

		const promise = this.Action('test', 'create').execute({
			type: 'behavioral',
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
			namePascal: 'CanBookAppointment',
		})

		await this.waitForInput()

		const last = this.ui.lastInvocation()
		assert.isTruthy(last.options.options.choices)
		assert.doesInclude(last.options.options.choices, {
			label: 'AbstractStoreTest',
		})

		await this.selectOptionBasedOnLabel('AbstractStoreTest')

		const results = await promise

		assert.isFalsy(results.errors)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'CanBookAppointment.test.ts',
			results.files
		)

		const contents = diskUtil.readFile(match)

		assert.doesInclude(
			contents,
			'CanBookAppointmentTest extends AbstractStoreTest'
		)

		await this.Service('build').build()

		const testResults = await this.Action('test', 'test').execute({
			shouldReportWhileRunning: false,
		})

		assert.isArray(testResults.errors)
		assert.isLength(testResults.errors, 1)

		const first = testResults.errors[0]

		assert.doesInclude(first.message, 'does not equal')
	}
}
