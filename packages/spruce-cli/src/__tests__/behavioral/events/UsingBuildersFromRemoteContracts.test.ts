import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class UsingBuildersFromRemoteContractsTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'

    @test()
    protected static async canCreateBuilderThatReferencesRemoteSkillsSchema() {
        const path = "'#spruce/schemas/heartwood/v2021_02_11/theme.schema'"
        const builderContents = `import { buildSchema } from '@sprucelabs/schema'
// eslint-disable-next-line spruce/prohibit-import-of-schema-in-builders
import themeSchema from ${path}

export default buildSchema({
    id: 'theme',
    name: 'Theme',
    fields: {
        ...themeSchema.fields,
        fieldName1: {
            type: 'text',
            label: 'First Field',
            isRequired: true,
        },
        fieldName2: {
            type: 'number',
            label: 'Second Field',
            isRequired: true,
            hint: 'A hint',
        },
    },
})
`

        const destination = this.resolvePath(
            'src/schemas/v2024_04_24/theme.builder.ts'
        )

        diskUtil.writeFile(destination, builderContents)
        const results = await this.Action('event', 'sync').execute({})
        assert.isFalsy(results.errors)
    }
}
