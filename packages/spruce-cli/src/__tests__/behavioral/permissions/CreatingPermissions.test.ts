import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import CreateAction from '../../../features/permission/actions/CreateAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingPermissionsTest extends AbstractSkillTest {
	protected static skillCacheKey = 'permissions'
	private static create: CreateAction

	protected static async beforeEach() {
		await super.beforeEach()
		this.create = this.Action('permission', 'create')
	}

	@test()
	protected static async canCreateCreatingPermissions() {
		assert.isFunction(this.create.execute)
	}

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
		const results = await this.execute(nameReadable)

		const expected = this.resolvePath(
			`src/permissions/${namesUtil.toKebab(nameReadable)}.permissions.ts`
		)

		const contractPath = testUtil.assertFileByPathInGeneratedFiles(
			expected,
			results.files
		)
		return { contractPath, results }
	}

	private static async execute(nameReadable: string) {
		return await this.create.execute({
			nameReadable,
			nameCamel: namesUtil.toCamel(nameReadable),
		})
	}
}
