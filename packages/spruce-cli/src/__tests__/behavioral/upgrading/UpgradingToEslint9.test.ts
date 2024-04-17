import fs from 'fs'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { templates } from '@sprucelabs/spruce-templates'
import { test, assert, errorAssert } from '@sprucelabs/test-utils'
import EsLint9Migrator, {
    Migrator,
    MigratorOptions,
} from '../../../migration/EsLint9Migrator'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingToEslint9Test extends AbstractCliTest {
    private static migrator: Migrator
    private static deletedFiles: string[] = []

    protected static async beforeEach() {
        await super.beforeEach()

        this.deletedFiles = []

        this.migrator = EsLint9Migrator.Migrator({ cwd: this.cwd })

        delete EsLint9Migrator.Class
        EsLint9Migrator.disk.deleteFile = (file) => {
            this.deletedFiles.push(file)
        }
    }

    @test()
    protected static async migratorThrowsWhenMissingRequired() {
        //@ts-ignore
        const err = assert.doesThrow(() => EsLint9Migrator.Migrator())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['cwd'],
        })
    }

    @test()
    protected static async deletesTheDotEsLintIgnoreIfItExists() {
        await this.copyLegacyModuleAndMigrate()
        assert.isEqual(this.deletedFiles[0], this.resolvePath('.eslintignore'))
    }

    @test()
    protected static async skipsIfDotEsLintIgnoreDoesNotExist() {
        await this.migrate()
        assert.isLength(this.deletedFiles, 0)
    }

    @test()
    protected static async deletesTheDotEsLintConfig() {
        await this.copyOverLegacyModule()
        await this.migrate()
        assert.isEqual(this.deletedFiles[1], this.resolvePath('.eslintrc.js'))
    }

    @test()
    protected static async overwritesVsCodeSettingsIfExist() {
        await this.copyOverLegacyModule()

        const settingsPath = this.resolvePath('.vscode/settings.json')
        diskUtil.writeFile(settingsPath, 'old settings')

        await this.migrate()

        const actual = diskUtil.readFile(settingsPath)
        const expected = await templates.vsCodeSettings()

        assert.isEqual(actual, expected)
    }

    @test()
    protected static async doesNotWriteTheFileIfItDoesNotExist() {
        await this.copyOverLegacyModule()
        const settingsPath = this.resolvePath('.vscode/settings.json')
        fs.rmSync(settingsPath, { force: true })

        await this.migrate()

        assert.isFalse(
            fs.existsSync(settingsPath),
            `Settings file should not exist`
        )
    }

    @test()
    protected static async callsMigratorInMigrateCommand() {
        EsLint9Migrator.Class = MockMigrator

        await this.copyOverLegacyModule()

        this.commandFaker.fakeCommand(/yarn/, 0)
        this.commandFaker.fakeCommand(/npm/, 0)

        await this.Action('node', 'upgrade').execute({})

        MockMigrator.assertDidMigrate()
        MockMigrator.assertStartupOptions({ cwd: this.cwd })
    }

    @test()
    protected static async doNotCopyEsLintConfigIfAlreadyExists() {
        await this.copyOverLegacyModule()
        const eslintrcPath = this.resolvePath('eslint.config.mjs')
        diskUtil.writeFile(eslintrcPath, 'old eslintrc')

        await this.migrate()

        const actual = diskUtil.readFile(eslintrcPath)
        assert.isEqual(actual, 'old eslintrc')
    }

    private static async copyLegacyModuleAndMigrate() {
        await this.copyOverLegacyModule()
        await this.migrate()
    }

    private static async migrate() {
        await this.migrator.migrate()
    }

    private static async copyOverLegacyModule() {
        const sourceZip = this.resolvePath(
            __dirname,
            '../../testDirsAndFiles/eslint-8-module.zip'
        )

        const copyCommand = `cp ${sourceZip} ${this.cwd}`
        const commands = this.Service('command')

        await commands.execute(copyCommand)

        const unzipCommand = `unzip -o eslint-8-module.zip`
        await commands.execute(unzipCommand)
    }
}

class MockMigrator implements Migrator {
    private static didMigrate = false
    private static constructorOptions?: MigratorOptions

    public constructor(options: MigratorOptions) {
        MockMigrator.constructorOptions = options
    }

    public async migrate(): Promise<void> {
        MockMigrator.didMigrate = true
    }

    public static assertDidMigrate() {
        assert.isTrue(this.didMigrate, `Migrator did not migrate`)
    }

    public static assertStartupOptions(options: MigratorOptions) {
        assert.isEqualDeep(this.constructorOptions, options)
    }

    public static reset() {
        this.didMigrate = false
        this.constructorOptions = undefined
    }
}
