import { test, assert } from '@sprucelabs/test'
import CreateAction from '../../../features/permission/actions/CreateAction'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class CreatingPermissionsTest extends AbstractCliTest {
	private static create: CreateAction

	protected static async beforeEach() {
		await super.beforeEach()
		await this.FeatureFixture().installCachedFeatures('permissions')
		this.create = this.Action('permission', 'create')
	}

	@test()
	protected static async canCreateCreatingPermissions() {
		assert.isFunction(this.create.execute)
	}

	@test()
	protected static async createsFileBasedOnName() {
		await this.create.execute({
			nameReadable: 'booking',
		})
	}
}
