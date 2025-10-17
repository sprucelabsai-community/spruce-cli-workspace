import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import MockProgramFactory from '../../tests/MockProgramFactory'

export default class OverridingCommandsInPackageJsonTest extends AbstractSkillTest {
    protected static skillCacheKey = 'schemas'
    private static originalPackageJson: string
    private static originalSettingsJson: string

    protected static async beforeEach() {
        await super.beforeEach()
        if (!this.originalPackageJson) {
            this.originalPackageJson = diskUtil.readFile(
                this.resolvePath('package.json')
            )
            this.originalSettingsJson = diskUtil.readFile(
                this.resolveHashSprucePath('settings.json')
            )
        } else {
            diskUtil.writeFile(
                this.resolvePath('package.json'),
                this.originalPackageJson
            )
            diskUtil.writeFile(
                this.resolveHashSprucePath('settings.json'),
                this.originalSettingsJson
            )
        }
    }

    @test('running honors overrides in package.json', 'package.json')
    @test('running honors overrides in settings.json', 'settings.json')
    protected static async runningCommandHonorsOverrides(
        override: OverrideFile
    ) {
        this.overrideOptions(override)

        const cli = await this.FeatureFixture().Cli({
            program: MockProgramFactory.Program(),
        })

        //@ts-ignore
        const executer = cli.getActionExecuter()
        await executer.Action('schema', 'sync').execute()

        this.assertCoreSchemasDidNotSync()
    }

    @test(
        'running honors overrides in package.json when command is forwarded',
        'package.json'
    )
    @test(
        'running honors overrides in settings.json when command is forwarded',
        'settings.json'
    )
    protected static async runningCommandHonorsOverridesWhenCommandIsForwarded(
        override: OverrideFile
    ) {
        this.overrideOptions(override)

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

        assert.isFalse(
            diskUtil.doesFileExist(personPath),
            'did not expect to find person.schema.ts'
        )
    }

    private static overrideOptions(override: OverrideFile) {
        if (override === 'settings.json') {
            const settings = this.Service('settings')
            settings.set('commandOverrides', {
                'sync.schemas': '--shouldFetchCoreSchemas false',
            })
        } else {
            const pkg = this.Service('pkg')
            pkg.set({
                path: ['skill', 'commandOverrides', 'sync.schemas'],
                value: '--shouldFetchCoreSchemas false',
            })
        }
    }
}

type OverrideFile = 'package.json' | 'settings.json'
