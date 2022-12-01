import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSchemaTest from '../../../tests/AbstractSchemaTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingSchemasWithGenericsTest extends AbstractSchemaTest {
	@test()
	protected static async schemaImportsLocalImports() {
		await this.installSchemaFeature('schemas')

		const source = this.resolveTestPath('schemas_with_suffix')

		const destination = this.resolvePath('src', 'schemas')

		await diskUtil.copyDir(source, destination)

		const results = await this.Action('schema', 'sync').execute({})

		assert.isFalsy(results.errors)
		assert.isTruthy(results.files)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'schemas.types.ts',
			results.files
		)

		const contents = diskUtil.readFile(match)
		assert.doesInclude(contents, '<Type extends string = string>')
		assert.doesInclude(contents, '<Type2 extends string = string>')
		assert.doesInclude(contents, '<Type>')
		assert.doesInclude(contents, "typedByGeneric'?: (Type2)| undefined | null")

		await this.assertValidActionResponseFiles(results)
	}
}
