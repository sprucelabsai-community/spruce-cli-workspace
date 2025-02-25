import { assertOptions } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import LintService from '../../services/LintService'
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
    private lintService: LintService

    protected constructor(options: StaticToInstanceMigratorOptions) {
        const { testFinder, testFileMigrator, lintService } = options
        this.testFinder = testFinder
        this.testFileMigrator = testFileMigrator
        this.lintService = lintService
    }

    public static Migrator(options: StaticToInstanceMigratorOptions) {
        assertOptions(options, [
            'testFinder',
            'testFileMigrator',
            'lintService',
        ])
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

        await this.lintService.fix('**/*.ts')

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
    lintService: LintService
}

export interface StaticToInstanceMigratorResults {
    totalTestsUpdated: number
    totalTestsSkipped: number
}

export interface StaticToInstanceMigrator {
    run(lookupDir: string): Promise<StaticToInstanceMigratorResults>
}
