import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import { test, assert } from '@sprucelabs/test'
import SpruceError from '../../../errors/SpruceError'
import AbstractSchemaTest from '../../../tests/AbstractSchemaTest'

export default class SyncingBadSchemasProvidesHelpfulErrorMessagesTest extends AbstractSchemaTest {
	@test()
	protected static async syncingBadSchemasProvidesHelpfulErrorMessages() {
		const cli = await this.syncSchemas('schemas')

		const schemasDir = this.resolvePath('src', 'schemas')
		await diskUtil.copyDir(
			this.resolveTestPath('test_builders_one_bad'),
			schemasDir
		)

		const results = await cli.getFeature('schema').Action('sync').execute({})
		assert.isArray(results.errors)

		errorAssertUtil.assertError(results.errors[0], 'SCHEMA_FAILED_TO_IMPORT')
		assert.doesInclude(results.errors[0].message, 'no is not defined')
	}

	@test()
	protected static throwingUnknownErrorDoesNotDoubleUpMessage() {
		const err = new SpruceError({
			//@ts-ignore
			code: 'GO_TEAM',
			friendlyMessage: 'This is a great error',
		})
		const message = err.friendlyMessage()
		assert.isEqual(message, 'This is a great error')
	}
}
