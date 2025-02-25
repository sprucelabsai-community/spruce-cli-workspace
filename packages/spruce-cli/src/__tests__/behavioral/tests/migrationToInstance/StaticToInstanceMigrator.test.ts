import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    suite,
    generateId,
} from '@sprucelabs/test-utils'
import {
    CommandService,
    ExecuteCommandOptions,
} from '../../../../services/CommandService'
import LintService from '../../../../services/LintService'
import StaticTestFinderImpl, {
    StaticTestFinder,
} from '../../../../tests/staticToInstanceMigration/StaticTestFinder'
import StaticToInstanceMigratorImpl, {
    StaticToInstanceMigrator,
} from '../../../../tests/staticToInstanceMigration/StaticToInstanceMigrator'
import StaticToInstanceTestFileMigratorImpl, {
    StaticToInstanceTestFileMigrator,
} from '../../../../tests/staticToInstanceMigration/StaticToInstanceTestFileMigrator'

@suite()
export default class StaticToInstanceMigratorTest extends AbstractSpruceTest {
    private testFinder: FakeStaticTestFinder
    private testFileMigrator: FakeFileMigrator
    private migrator: StaticToInstanceMigrator
    private readFiles: string[] = []
    private fakedFileContents: Record<string, string> = {}
    private lastWrittenFile?: { destination: string; contents: string }
    private spyCommandService: SpyCommandService

    public constructor() {
        super()

        StaticTestFinderImpl.Class = FakeStaticTestFinder
        StaticToInstanceTestFileMigratorImpl.Class = FakeFileMigrator

        StaticToInstanceMigratorImpl.diskUtil.readFile = (source) => {
            this.readFiles.push(source)
            return this.fakedFileContents[source] ?? generateId()
        }

        StaticToInstanceMigratorImpl.diskUtil.writeFile = (
            destination: string,
            contents: string
        ) => {
            this.lastWrittenFile = {
                destination,
                contents,
            }
        }

        this.testFinder = StaticTestFinderImpl.Finder() as FakeStaticTestFinder
        this.testFileMigrator =
            StaticToInstanceTestFileMigratorImpl.Migrator() as FakeFileMigrator
        this.spyCommandService = new SpyCommandService()
        const lintService = new LintService(
            this.cwd,
            () => this.spyCommandService
        )

        this.migrator = StaticToInstanceMigratorImpl.Migrator({
            testFinder: this.testFinder,
            testFileMigrator: this.testFileMigrator,
            lintService,
        })
    }

    @test()
    protected throwsWithMissing() {
        const err = assert.doesThrow(() =>
            //@ts-ignore
            StaticToInstanceMigratorImpl.Migrator()
        )
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['testFinder', 'testFileMigrator', 'lintService'],
        })
    }

    @test()
    protected async runThrowsWithMissing() {
        //@ts-ignore
        const err = await assert.doesThrowAsync(() => this.migrator.run())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['lookupDir'],
        })
    }

    @test()
    protected async passesLookupDirToTestFinder() {
        const path = generateId()
        await this.run(path)
        assert.isEqual(this.testFinder.lastLookupDir, path)
    }

    @test('returns stats based on 3 tests found', ['a', 'b', 'c'])
    @test('returns stats based on 0 tests found', [])
    protected async returnsStatsBasedOnTestsFound(results: string[]) {
        this.setFakedFinderResults(results)
        const stats = await this.run()
        assert.isEqualDeep(stats, {
            totalTestsUpdated: this.testFinder.fakedResults.length,
            totalTestsSkipped: 0,
        })
    }

    @test('passes one files contents to migrator', 'a')
    @test('passes another files contents to migrator', 'b')
    protected async passesOneFilesContentsToMigrator(filename: string) {
        this.setFakedFinderResults([filename])
        await this.run()
        assert.isEqualDeep(this.readFiles, [filename])
    }

    @test()
    protected async passesResultsOfFileToMigrator() {
        this.setFakedFinderResults(['a'])
        this.setFakedFileContents({
            a: generateId(),
        })
        await this.run()

        this.assertContentsPassedToFileMigratorEquals([
            this.fakedFileContents['a'],
        ])
    }

    @test()
    protected async passesResultsOfMultipleFilesToMigrator() {
        const contents1 = generateId()
        const contents2 = generateId()

        this.setFakedFinderResults(['what', 'the'])

        this.setFakedFileContents({
            what: contents1,
            the: contents2,
        })

        await this.run()

        this.assertContentsPassedToFileMigratorEquals([contents1, contents2])
    }

    @test()
    protected async writesResponseOfMigrate() {
        const filename = generateId()

        this.setFakedFinderResults([filename])
        this.setFakedFileContents({
            [filename]: generateId(),
        })

        await this.run()

        assert.isEqualDeep(this.lastWrittenFile, {
            destination: filename,
            contents: this.testFileMigrator.fakedMigrateResponse,
        })
    }

    @test()
    protected async returnsSkippedIfMigratedIsTheSame() {
        this.setFakedFinderResults(['a'])
        const contents = generateId()
        this.setFakedFileContents({
            a: contents,
        })

        this.setMigrateFileResponse(contents)

        const stats = await this.run()
        assert.isEqualDeep(stats, {
            totalTestsUpdated: 0,
            totalTestsSkipped: 1,
        })
    }

    @test()
    protected async countsSkippedAndMatched() {
        const contents1 = generateId()
        const contents2 = generateId()

        this.setFakedFinderResults(['what', 'the', 'heck'])
        this.setFakedFileContents({
            what: contents1,
            the: contents2,
            heck: generateId(),
        })

        this.testFileMigrator.fakedMigrateResponsesByContents = {
            [contents1]: contents1,
            [contents2]: contents2,
        }

        const stats = await this.run()
        assert.isEqualDeep(stats, {
            totalTestsUpdated: 1,
            totalTestsSkipped: 2,
        })
    }

    @test()
    protected async doesNotWriteFileThatDidNotChange() {
        this.setFakedFinderResults(['a'])
        const contents = generateId()
        this.setFakedFileContents({
            a: contents,
        })

        this.setMigrateFileResponse(contents)

        await this.run()
        assert.isUndefined(this.lastWrittenFile)
    }

    @test()
    protected async lintsMigratedFiles() {
        await this.run()
        assert.isTrue(this.spyCommandService.didExecute)
        assert.doesInclude(
            this.spyCommandService.lastCommand,
            `await cli.lintFiles(['**/*.ts'])`
        )
    }

    @test()
    protected async shouldLintAfterMigrating() {
        this.setFakedFinderResults(['match'])
        this.setFakedFileContents({
            match: generateId(),
        })

        StaticToInstanceMigratorImpl.diskUtil.writeFile = () => {
            assert.isFalse(
                this.spyCommandService.didExecute,
                'Should not lint yet'
            )
        }

        await this.run()
    }

    private setMigrateFileResponse(contents: string) {
        this.testFileMigrator.fakedMigrateResponse = contents
    }

    private assertContentsPassedToFileMigratorEquals(expected: string[]) {
        assert.isEqualDeep(
            this.testFileMigrator.contentsPassedToMigrate,
            expected
        )
    }

    private setFakedFileContents(contents: Record<string, string>) {
        this.fakedFileContents = contents
    }

    private setFakedFinderResults(results: string[]) {
        this.testFinder.fakedResults = results
    }

    private async run(path?: string) {
        return await this.migrator.run(path ?? generateId())
    }
}

class FakeStaticTestFinder implements StaticTestFinder {
    public lastLookupDir?: string
    public fakedResults: string[] = []

    public async find(lookupDir: string): Promise<string[]> {
        this.lastLookupDir = lookupDir
        return this.fakedResults
    }
}

class FakeFileMigrator implements StaticToInstanceTestFileMigrator {
    public contentsPassedToMigrate: string[] = []
    public fakedMigrateResponse = generateId()
    public fakedMigrateResponsesByContents: Record<string, string> = {}

    public migrate(contents: string): string {
        this.contentsPassedToMigrate.push(contents)
        return (
            this.fakedMigrateResponsesByContents[contents] ??
            this.fakedMigrateResponse
        )
    }
}

class SpyCommandService implements CommandService {
    public didExecute = false
    public lastCommand?: string
    public async execute(
        cmd: string,
        options?: ExecuteCommandOptions
    ): Promise<{ stdout: string }> {
        this.lastCommand = options?.args?.[1] ?? cmd
        this.didExecute = true
        return {
            stdout: generateId(),
        }
    }
    public kill(): void {}
    public pid(): number | undefined {
        return 0
    }
}
