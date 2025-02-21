import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    suite,
} from '@sprucelabs/test-utils'
import StaticTestFinderImpl from '../../../../tests/staticToInstanceMigration/StaticTestFinder'

@suite()
export default class StaticTestFinderTest extends AbstractSpruceTest {
    private finder: StaticTestFinderImpl = StaticTestFinderImpl.Finder()
    private testPath?: string

    @test()
    protected async throwsWithMissing() {
        //@ts-ignore
        const err = await assert.doesThrowAsync(() => this.finder.find())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['lookupDir'],
        })
    }

    @test()
    protected async matchesStaticTests1() {
        this.setTestMigrationDir('static_test_migration_1')
        await this.assertFindResultsEqual([
            'AnotherStaticTest.test.ts',
            'StaticTest1.test.ts',
        ])
    }

    @test()
    protected async matchesStaticTests2() {
        this.setTestMigrationDir('static_test_migration_2')
        await this.assertFindResultsEqual([
            'AStaticTest.test.ts',
            'AnotherStaticTest1.test.ts',
        ])
    }

    @test()
    protected async includesAbstractTestsInOtherDirectories() {
        this.setTestMigrationDir('static_test_migration_3')
        await this.assertFindResultsEqual([
            'AbstractWhateverTest.ts',
            'AStaticTest2.test.ts',
        ])
    }

    private async assertFindResultsEqual(files: string[]) {
        const results = await this.find()
        const expected = files.map((file) => this.resolveStaticTestFile(file))
        assert.isEqualDeep(results, expected)
    }

    private async find() {
        return await this.finder.find(this.testPath!)
    }

    private resolveStaticTestFile(file: string) {
        return this.resolvePath(this.testPath!, 'src', '__tests__', file)
    }

    private setTestMigrationDir(dirName: string) {
        this.testPath = this.resolvePath(
            'build',
            '__tests__',
            'testDirsAndFiles',
            dirName
        )
    }
}
