import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSchemaTest from '../../../tests/AbstractSchemaTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class ImportingSchemaImportsTest extends AbstractSchemaTest {
    @test()
    protected static async schemaImportsLocalImports() {
        await this.installSchemaFeature('schemas')

        const source = this.resolveTestPath('schemas_with_imports')

        const destination = this.resolvePath('src', 'schemas')

        await diskUtil.copyDir(source, destination)

        diskUtil.writeFile(
            this.resolvePath('src', 'widgets', 'widgets.types.ts'),
            'export type BaseWidget = {}'
        )

        const results = await this.Action('schema', 'sync').execute({})

        assert.isFalsy(results.errors)
        assert.isTruthy(results.files)

        const match = testUtil.assertFileByNameInGeneratedFiles(
            'schemas.types.ts',
            results.files
        )

        const contents = diskUtil.readFile(match)
        assert.doesInclude(
            contents,
            "import { BaseWidget } from '" + "#spruce/../widgets/widgets.types'"
        )

        await this.assertValidActionResponseFiles(results)
    }
}
