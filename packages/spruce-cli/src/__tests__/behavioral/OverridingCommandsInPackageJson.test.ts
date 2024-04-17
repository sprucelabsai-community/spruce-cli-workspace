import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import MockProgramFactory from '../../tests/MockProgramFactory'

export default class OverridingCommandsInPackageJsonTest extends AbstractSkillTest {
    protected static skillCacheKey = 'schemas'

    @test()
    protected static async runningCommandHonorsOverrides() {
        this.overrideOptions()

        const cli = await this.FeatureFixture().Cli({
            program: MockProgramFactory.Program(),
        })

        //@ts-ignore
        const executer = cli.getActionExecuter()
        await executer.Action('schema', 'sync').execute()

        this.assertCoreSchemasDidNotSync()
    }

    @test()
    protected static async runningCommandHonorsOverridesWhenCommandIsForwarded() {
        this.overrideOptions()

        const cli = await this.FeatureFixture().Cli({
            program: MockProgramFactory.Program(),
        })

        //@ts-ignore
        const executer = cli.getActionExecuter()
        await executer.Action('schema', 'create').execute({
            nameReadable: 'Test schema!',
            namePascal: 'Test',
            nameCamel: 'test',
            description: 'this is so great!',
        })

        this.assertCoreSchemasDidNotSync()
    }

    private static assertCoreSchemasDidNotSync() {
        const personPath = this.resolveHashSprucePath(
            'schemas',
            'spruce',
            'v2020_07_22',
            'person.schema.ts'
        )

        assert.isFalse(diskUtil.doesFileExist(personPath))
    }

    private static overrideOptions() {
        const pkg = this.Service('pkg')
        pkg.set({
            path: ['skill', 'commandOverrides', 'sync.schemas'],
            value: '--shouldFetchCoreSchemas false',
        })
    }
}
