import { HASH_SPRUCE_DIR, diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import CommandService from '../../../services/CommandService'
import PkgService from '../../../services/PkgService'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import ScriptUpdaterImpl, {
    ScriptUpdater,
} from '../../../updaters/ScriptUpdater'
import WriterFactory from '../../../writers/WriterFactory'

export default class UpgradingANonSpruceNodeModuleTest extends AbstractCliTest {
    private static pkg: PkgService

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()

        ScriptUpdaterImpl.Class = MockScriptUpdater
        MockScriptUpdater.reset()

        WriterFactory.setWriter('node', MockNodeWriter)
        MockNodeWriter.reset()

        this.cwd = this.resolvePath(generateId() + '_module')
        diskUtil.createDir(this.cwd)

        await this.initModule()
        this.fakeYarnCommands()

        this.pkg = this.Service('pkg')
    }

    @test()
    protected static async doesNotCreateHashSpruceOnUpdate() {
        await this.upgrade()

        const doesHashSpruceExist = diskUtil.doesDirExist(
            diskUtil.resolvePath(this.cwd, HASH_SPRUCE_DIR)
        )

        assert.isFalse(
            doesHashSpruceExist,
            'Should not have created any hash_spruce_dir'
        )
    }

    @test()
    protected static async doesNotTryToUpdateScripts() {
        await this.upgrade()
        MockScriptUpdater.assertWasNotCalled()
    }

    @test()
    protected static async doesNotWriteNodeFiles() {
        await this.upgrade()
        MockNodeWriter.assertWasNotCalled()
    }

    @test()
    protected static async passesTheWFlagIfInWorkspace() {
        this.setWorkspaces(['packages/*'])

        let wasHit = false

        CommandService.fakeCommand(/yarn.*?-W/, {
            code: 0,
            callback: () => {
                wasHit = true
            },
        })

        await this.pkg.install(['test'])

        assert.isTrue(wasHit, `Did not add the -W flag when in a workspace`)
    }

    @test()
    protected static async shouldNotInstallDependenciesNotAlreadyInstalled() {
        this.addDependencyDirectlyToPackage()

        const commands: string[] = []

        CommandService.fakeCommand(/yarn.*?add .*/gis, {
            code: 0,
            callback: (command, args) => {
                commands.push([command, ...args].join(' '))
            },
        })

        await this.upgrade()

        assert.isEqualDeep(commands, ['yarn add @sprucelabs/spruce-core'])
    }

    @test()
    protected static async shouldNotTryAndBuildAfterUpgrade() {
        this.commandFaker.makeCommandThrow(`yarn build.dev`)
        await this.upgrade()
    }

    @test()
    protected static async shouldNotCleanBuild() {
        this.commandFaker.makeCommandThrow(`yarn clean.build`)
        await this.upgrade()
    }

    @test.skip('revisit when really ready to loop through workspaces')
    protected static async runsUpgradeInEveryPackageInWorkspace() {
        this.setWorkspaces(['packages/*'])

        CommandService.clearFakedResponses()

        const moduleName = 'test1'
        const path = this.resolvePath('packages', moduleName)
        diskUtil.createDir(path)

        const commands = this.Service('command', path)
        await commands.execute('yarn init -y')

        const pkg = this.Service('pkg', path)
        this.addDependencyDirectlyToPackage(pkg)

        this.fakeYarnCommands()

        await this.emitter.on('feature.did-execute', async (payload) => {
            console.log(payload)
        })

        await this.upgrade()
    }

    private static setWorkspaces(packages: string[]) {
        this.pkg.set({
            path: 'workspaces',
            value: packages,
        })
    }

    private static addDependencyDirectlyToPackage(
        pkgService: PkgService = this.pkg
    ) {
        pkgService.set({
            path: 'dependencies',
            value: {
                '@sprucelabs/spruce-core': '1.0.0',
            },
        })
    }

    private static async upgrade() {
        const upgrade = this.Action('node', 'upgrade', {})
        const results = await upgrade.execute({})
        assert.isLength(
            results.errors ?? [],
            0,
            `Should not have had any errors, but got '${results?.errors?.[0]?.message}'`
        )
    }

    private static fakeYarnCommands() {
        this.commandFaker.fakeCommand(/yarn/, 0)
        this.commandFaker.makeCommandThrow(`yarn fix.lint`)
    }

    private static async initModule() {
        await this.Service('command').execute('yarn init -y')
    }
}

class MockScriptUpdater implements ScriptUpdater {
    private static wasCalled = false

    public static assertWasNotCalled() {
        assert.isFalse(
            this.wasCalled,
            'ScriptUpdater was called when it should not have been'
        )
    }

    public static reset() {
        this.wasCalled = false
    }

    public async update(): Promise<void> {
        MockScriptUpdater.wasCalled = true
        assert.fail('MockScriptUpdater should not be called')
    }
}

class MockNodeWriter {
    public static wasCalled = false

    public static assertWasNotCalled() {
        assert.isFalse(
            this.wasCalled,
            'NodeWriter was called when it should not have been'
        )
    }

    public async writeNodeModule() {
        MockNodeWriter.wasCalled = true
        return []
    }

    public static reset() {
        this.wasCalled = false
    }
}
