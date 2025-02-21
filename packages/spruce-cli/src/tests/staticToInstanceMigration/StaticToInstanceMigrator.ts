import { assertOptions } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import StaticTestFinder from './StaticTestFinder'
import { StaticToInstanceTestFileMigrator } from './StaticToInstanceTestFileMigrator'

export default class StaticToInstanceMigratorImpl
    implements StaticToInstanceMigrator
{
    public static diskUtil = diskUtil
    public static Class?: new (
        options: StaticToInstanceMigratorOptions
    ) => StaticToInstanceMigrator

    private testFinder: StaticTestFinder
    private testFileMigrator: StaticToInstanceTestFileMigrator

    protected constructor(options: StaticToInstanceMigratorOptions) {
        const { testFinder, testFileMigrator } = options
        this.testFinder = testFinder
        this.testFileMigrator = testFileMigrator
    }

    public static Migrator(options: StaticToInstanceMigratorOptions) {
        assertOptions(options, ['testFinder', 'testFileMigrator'])
        return new (this.Class ?? this)(options)
    }

    public async run(lookupDir: string) {
        assertOptions({ lookupDir }, ['lookupDir'])
        const matches = await this.testFinder.find(lookupDir)

        let totalTestsUpdated = 0
        let totalTestsSkipped = 0

        for (const match of matches) {
            const contents = this.readFile(match)
            const updated = this.testFileMigrator.migrate(contents)
            if (contents === updated) {
                totalTestsSkipped++
            } else {
                totalTestsUpdated++
                this.writeFile(match, updated)
            }
        }

        return {
            totalTestsUpdated,
            totalTestsSkipped,
        }
    }

    private readFile(match: string) {
        return StaticToInstanceMigratorImpl.diskUtil.readFile(match)
    }

    private writeFile(match: string, updated: string) {
        StaticToInstanceMigratorImpl.diskUtil.writeFile(match, updated)
    }
}

export interface StaticToInstanceMigratorOptions {
    testFinder: StaticTestFinder
    testFileMigrator: StaticToInstanceTestFileMigrator
}

export interface StaticToInstanceMigratorResults {
    totalTestsUpdated: number
    totalTestsSkipped: number
}

export interface StaticToInstanceMigrator {
    run(lookupDir: string): Promise<StaticToInstanceMigratorResults>
}
