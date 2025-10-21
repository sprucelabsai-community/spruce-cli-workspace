import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import generateShortAlphaId from '../permissions/support/generateShortAlphaId'

export default class SyncingSchemasInChildDirInGoTest extends AbstractSkillTest {
    protected static skillCacheKey = 'schemas'
    private static schemaNameCamel = generateShortAlphaId()

    @test()
    protected static async importsTheCorrectPath() {
        await this.go.initGoProject()
        await this.createSchema()

        const dir = 'pgk'
        diskUtil.createDir(this.resolvePath(dir))

        this.cwd = this.resolvePath(dir)
        this.setCwd(this.cwd)

        const results = await this.Action('schema', 'sync', {
            shouldAutoHandleDependencies: true,
        }).execute({
            schemaLookupDir: '../src/',
        })

        assert.isFalsy(
            results.errors,
            'Expected no errors when syncing schema.'
        )

        await this.go.vet()
    }

    private static async createSchema() {
        const results = await this.Action('schema', 'create').execute({
            nameReadable: 'A schema i built!',
            nameCamel: this.schemaNameCamel,
        })

        assert.isFalsy(
            results.errors,
            'Expected no errors when creating schema.'
        )
    }
}
