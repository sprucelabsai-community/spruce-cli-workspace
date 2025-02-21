import { test, assert } from '@sprucelabs/test-utils'
import MigrationAction from '../../../../features/test/actions/MigrateAction'
import AbstractSkillTest from '../../../../tests/AbstractSkillTest'
import StaticToInstanceMigratorImpl, {
    StaticToInstanceMigrator,
    StaticToInstanceMigratorOptions,
    StaticToInstanceMigratorResults,
} from '../../../../tests/staticToInstanceMigration/StaticToInstanceMigrator'

export default class MigratingTestsTest extends AbstractSkillTest {
    private static action: MigrationAction
    protected static skillCacheKey = 'tests'

    protected static async beforeEach() {
        await super.beforeEach()
        StaticToInstanceMigratorImpl.Class = FakeStaticToInstanceMigrator
        this.action = this.Action('test', 'migrate')
    }

    @test()
    protected static async hasMigrateAction() {
        assert.isFunction(this.Action('test', 'migrate').execute)
    }

    @test()
    protected static async migrateCreatsMigrator() {
        const results = await this.execute()
        assert.isFalsy(results.errors)
        assert.isTruthy(this.migrator, 'Migrator not created')
    }

    @test()
    protected static async migratorRunsMigratePassingLookupDir() {
        await this.execute()
        this.migrator.assertLookupCalledWith(
            this.resolvePath('src', '__tests__')
        )
    }

    @test('returns results from migrator 1', 1, 1)
    @test('returns results from migrator 2', 2, 3)
    protected static async returnsResultsFromMigrator(
        totalTestsSkipped: number,
        totalTestsUpdated: number
    ) {
        FakeStaticToInstanceMigrator.runResults = {
            totalTestsSkipped,
            totalTestsUpdated,
        }

        const results = await this.execute()
        assert.isEqualDeep(results, {
            headline: 'Migrated tests from static to instance based',
            summaryLines: [
                `${totalTestsUpdated} test${totalTestsUpdated === 1 ? '' : 's'} updated`,
                `${totalTestsSkipped} test${totalTestsSkipped === 1 ? '' : 's'} skipped`,
            ],
        })
    }

    private static get migrator(): FakeStaticToInstanceMigrator {
        return FakeStaticToInstanceMigrator.instance
    }

    private static async execute() {
        return await this.action.execute()
    }
}

class FakeStaticToInstanceMigrator implements StaticToInstanceMigrator {
    public static instance: FakeStaticToInstanceMigrator
    private passedLookupDir?: string
    public static runResults?: StaticToInstanceMigratorResults

    public constructor(_options: StaticToInstanceMigratorOptions) {
        FakeStaticToInstanceMigrator.instance = this
    }

    public async run(
        lookupDir: string
    ): Promise<StaticToInstanceMigratorResults> {
        this.passedLookupDir = lookupDir

        return (
            FakeStaticToInstanceMigrator.runResults ?? {
                totalTestsUpdated: 0,
                totalTestsSkipped: 0,
            }
        )
    }

    public assertLookupCalledWith(expected: string) {
        assert.isEqual(
            this.passedLookupDir,
            expected,
            `Migrator.run was not called with expected lookup dir.`
        )
    }
}
