import Schema from '@sprucelabs/schema'
import BaseSpruceTest, { test, assert } from '@sprucelabs/test-utils'
import cliUserSchema from '#spruce/schemas/spruceCli/v2020_07_22/personWithToken.schema'

export default class UsingSchemasInCli extends BaseSpruceTest {
	@test()
	protected static async instantiateSchema() {
		const user = new Schema(cliUserSchema, {
			casualName: 'Amigo',
		})
		assert.isEqual(user.get('casualName'), 'Amigo')
	}
}
