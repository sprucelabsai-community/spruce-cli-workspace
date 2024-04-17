import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSchemaTest from '../../tests/AbstractSchemaTest'

export default class ValueTypeMappingTest extends AbstractSchemaTest {
    protected static async beforeEach() {
        await super.beforeEach()
        await this.installSchemaFeature('schemas')
    }

    @test.skip('enable when enable introduction of new schema fields')
    protected static async dropsMappersIntoFieldTypes() {
        await this.Action('schema', 'sync').execute({})

        const fieldTypesFile = this.resolveHashSprucePath(
            'schemas',
            'fields',
            'fields.types.ts'
        )
        const typeContents = diskUtil.readFile(fieldTypesFile)
        assert.doesInclude(
            typeContents,
            'SchemaFieldValueTypeMapper<F extends SchemaFieldFieldDefinition? F : SchemaFieldFieldDefinition, CreateEntityInstances>'
        )
        assert.doesInclude(
            typeContents,
            'SelectFieldValueTypeMapper<F extends SelectFieldDefinition ? F: SelectFieldDefinition>'
        )

        await this.Service('typeChecker').check(fieldTypesFile)
    }
}
