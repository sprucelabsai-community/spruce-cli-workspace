import { test, assert } from '@sprucelabs/test-utils'
import schemaGeneratorUtil from '../../features/schema/utilities/schemaGenerator.utility'
import AbstractSchemaTest from '../../tests/AbstractSchemaTest'

export default class DeletingOrphanedSchemaDefinitionsTest extends AbstractSchemaTest {
    @test()
    protected static async hasFunction() {
        assert.isFunction(schemaGeneratorUtil.filterSchemaFilesBySchemaIds)
    }

    @test()
    protected static async findsAllSchemas() {
        const results = await schemaGeneratorUtil.filterSchemaFilesBySchemaIds(
            this.resolveTestPath('orphaned_schemas'),
            [
                { id: 'one', namespace: 'namespace', version: 'v2020_07_22' },
                { id: 'two' },
                // it should camel case the namespace
                { id: 'three', namespace: 'Namespacetwo' },
                {
                    id: 'four',
                    namespace: 'namespacetwo',
                    version: 'v2020_07_22',
                },
            ]
        )

        assert.isEqual(results.length, 0)
    }

    @test()
    protected static async findsOneMissing() {
        const results = await schemaGeneratorUtil.filterSchemaFilesBySchemaIds(
            this.resolveTestPath('orphaned_schemas'),
            [{ id: 'one', namespace: 'namespace', version: 'v2020_07_22' }]
        )

        assert.isEqual(results.length, 3)
        assert.doesInclude(results[0], /two\.schema\.[t|j]s/gi)
    }
}
