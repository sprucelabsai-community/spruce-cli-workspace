import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../tests/AbstractCliTest'
import testUtil from '../../tests/utilities/test.utility'

export default class BootingWithBadFilesTest extends AbstractCliTest {
	@test()
	protected static async bootingWithAEmptySchemaThrowsErrorWithNameOfBadSchema() {
		const bootResults = await this.breakSchemaAndBoot()
		assert.isTruthy(bootResults.errors)
		assert.doesInclude(bootResults.errors[0].message, 'location.schema.ts')
	}

	@test()
	protected static async disablesSchemaCheckingWithFlag() {
		process.env.SHOULD_VALIDATE_SCHEMAS_ON_BOOT = 'false'
		const bootResults = await this.breakSchemaAndBoot()
		assert.isFalsy(bootResults.errors)
	}

	private static async breakSchemaAndBoot() {
		await this.FeatureFixture().installCachedFeatures('schemas')

		const results = await this.Action('schema', 'sync').execute({})

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'location.schema.ts',
			results.files
		)

		diskUtil.writeFile(match, '')

		const bootResults = await this.Action('skill', 'boot').execute({
			local: true,
		})

		return bootResults
	}
}
