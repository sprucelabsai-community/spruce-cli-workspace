import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    suite,
    generateId,
} from '@sprucelabs/test-utils'
import StaticTestFinderImpl, {
    StaticTestFinder,
} from '../../../../tests/staticToInstanceMigration/StaticTestFinder'
import StaticToInstanceMigrator from '../../../../tests/staticToInstanceMigration/StaticToInstanceMigrator'
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

    public constructor() {
        super()

        StaticTestFinderImpl.Class = FakeStaticTestFinder
        StaticToInstanceTestFileMigratorImpl.Class = FakeFileMigrator

        StaticToInstanceMigrator.diskUtil.readFile = (source) => {
            this.readFiles.push(source)
            return this.fakedFileContents[source] ?? generateId()
        }

        StaticToInstanceMigrator.diskUtil.writeFile = (
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

        this.migrator = StaticToInstanceMigrator.Migrator({
            testFinder: this.testFinder,
            testFileMigrator: this.testFileMigrator,
        })
    }

    @test()
    protected throwsWithMissing() {
        //@ts-ignore
        const err = assert.doesThrow(() => StaticToInstanceMigrator.Migrator())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['testFinder', 'testFileMigrator'],
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
    public migrate(contents: string): string {
        this.contentsPassedToMigrate.push(contents)
        return this.fakedMigrateResponse
    }
}
