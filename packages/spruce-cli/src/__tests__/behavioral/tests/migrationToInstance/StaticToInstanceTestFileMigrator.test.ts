import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    suite,
} from '@sprucelabs/test-utils'
import StaticToInstanceTestFileMigratorImpl, {
    StaticToInstanceTestFileMigrator,
} from '../../../../tests/staticToInstanceMigration/StaticToInstanceTestFileMigrator'

@suite()
export default class StaticToInstanceTestFileMigratorTest extends AbstractSpruceTest {
    private migrator: StaticToInstanceTestFileMigrator =
        StaticToInstanceTestFileMigratorImpl.Migrator()

    @test()
    protected throwsWithMissing() {
        //@ts-ignore
        const err = assert.doesThrow(() => this.migrate())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['contents'],
        })
    }

    @test()
    protected returnsEmptyString() {
        this.assertMigratedEquals('', '')
    }

    @test()
    protected fixesStaticFunction() {
        this.assertMigratedEquals(
            `@test()
protected static myTest() {}`,
            `@test()
protected myTest() {}`
        )
    }

    @test()
    protected fixesStaticAsyncFunctions() {
        this.assertMigratedEquals(
            `@test()
protected static async myTest() {}`,
            `@test()
protected async myTest() {}`
        )
    }

    @test()
    protected doesNotMessWithStaticInVariableName() {
        this.assertMigratedEquals(
            `protected staticInName() {}`,
            `protected staticInName() {}`
        )
    }

    @test()
    protected addsSuiteDecoratorToClassIfNotThere() {
        this.assertMigratedEquals(
            `export default class Test {}`,
            `@suite()\nexport default class Test {}`
        )
    }

    @test()
    protected doesNotAddSuitIfAnotherClassExported() {
        this.assertMigratedEquals(
            `export class Test {}`,
            `export class Test {}`
        )
    }

    @test()
    protected doesNotAddSuiteIfAlreadyThere() {
        this.assertMigratedEquals(
            `@suite()\nexport default class Test {}`,
            `@suite()\nexport default class Test {}`
        )
    }

    @test()
    protected addsImportIfNotThere() {
        this.assertMigratedEquals(
            `import { test } from '@sprucelabs/test-utils'`,
            `import { test, suite } from '@sprucelabs/test-utils'`
        )
    }

    @test()
    protected doesNotMessWithAnythingWithTestInName() {
        this.assertMigratedEquals(
            `protected testing() {}`,
            `protected testing() {}`
        )
    }

    @test()
    protected doesNoIncludeSuiteTwice() {
        this.assertMigratedEquals(
            `import { test, suite } from '@sprucelabs/test-utils'`,
            `import { test, suite } from '@sprucelabs/test-utils'`
        )
    }

    @test()
    protected includesSuiteEvenIfSuiteIsInAMethodName() {
        this.assertMigratedEquals(
            `import { test } from '@sprucelabs/test-utils
protected suiteMethod() {}`,
            `import { test, suite } from '@sprucelabs/test-utils
protected suiteMethod() {}`
        )
    }

    @test()
    protected includesSuiteWithMultipleImports() {
        this.assertMigratedEquals(
            `import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
} from '@sprucelabs/test-utils'`,
            `import AbstractSpruceTest, {
    test, 
    suite,
    assert,
    errorAssert,
} from '@sprucelabs/test-utils'`
        )
    }

    @test()
    protected canMigrateWholeTest() {
        const before = this.readTestFile('StaticTest.txt')
        const expected = this.readTestFile('InstanceTest.txt')

        this.assertMigratedEquals(before, expected)
    }

    @test()
    protected properlyMigrationsAbstractTests() {
        const before = this.readTestFile('AbstractStaticTest.txt')
        const expected = this.readTestFile('AbstractInstanceTest.txt')

        this.assertMigratedEquals(before, expected)
    }

    private readTestFile(name: string) {
        return diskUtil.readFile(this.resolveTestClassPath(name))
    }

    private resolveTestClassPath(name: string) {
        return this.resolvePath(__dirname, 'support', name)
    }

    private assertMigratedEquals(contents: string, expected: string) {
        const actual = this.migrate(contents)
        assert.isEqual(this.cleanString(actual), this.cleanString(expected))
    }

    private cleanString(contents: string) {
        return contents.replace(/\s{2,}/g, ' ')
    }

    private migrate(contents: string) {
        return this.migrator.migrate(contents)
    }
}
