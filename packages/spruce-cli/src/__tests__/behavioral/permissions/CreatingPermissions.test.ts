import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import testUtil from '../../../tests/utilities/test.utility'
import AbstractPermissionsTest from './support/AbstractPermissionsTest'

export default class CreatingPermissionsTest extends AbstractPermissionsTest {
	@test('can create permission contract named booking', 'booking')
	@test('can create permission contract named awesome', 'awesome')
	@test(
		'can create permission contract named Point of Sale Checkout',
		'Point of Sale Checkout'
	)
	protected static async createsFileBasedOnName(nameReadable: string) {
		const { results } = await this.executeAndGetContract(nameReadable)
		await this.assertValidActionResponseFiles(results)
	}

	@test()
	protected static async rendersExpectedTemplate() {
		const { contractPath } = await this.executeAndGetContract()
		const contents = diskUtil.readFile(contractPath)
		assert.doesInclude(
			contents,
			'const bookingPermissions = buildPermissionContract'
		)
	}

	private static async executeAndGetContract(nameReadable = 'Booking') {
		const results = await this.createPermissionContract(nameReadable)

		const expected = this.resolvePath(
			`src/permissions/${namesUtil.toKebab(nameReadable)}.permissions.ts`
		)

		const contractPath = testUtil.assertFileByPathInGeneratedFiles(
			expected,
			results.files
		)
		return { contractPath, results }
	}
}
