import { assertOptions } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import StaticTestFinder from './StaticTestFinder'
import { StaticToInstanceTestFileMigrator } from './StaticToInstanceTestFileMigrator'

export default class StaticToInstanceMigrator {
    public static diskUtil = diskUtil

    private testFinder: StaticTestFinder
    private testFileMigrator: StaticToInstanceTestFileMigrator

    protected constructor(options: StaticToInstanceMigratorOptions) {
        const { testFinder, testFileMigrator } = options
        this.testFinder = testFinder
        this.testFileMigrator = testFileMigrator
    }

    public static Migrator(options: StaticToInstanceMigratorOptions) {
        assertOptions(options, ['testFinder', 'testFileMigrator'])
        return new this(options)
    }

    public async run(lookupDir: string) {
        assertOptions({ lookupDir }, ['lookupDir'])
        const matches = await this.testFinder.find(lookupDir)

        for (const match of matches) {
            const contents = this.readFile(match)
            const updated = this.testFileMigrator.migrate(contents)
            this.writeFile(match, updated)
        }

        return {
            totalTestsUpdated: matches.length,
        }
    }

    private readFile(match: string) {
        return StaticToInstanceMigrator.diskUtil.readFile(match)
    }

    private writeFile(match: string, updated: string) {
        StaticToInstanceMigrator.diskUtil.writeFile(match, updated)
    }
}

interface StaticToInstanceMigratorOptions {
    testFinder: StaticTestFinder
    testFileMigrator: StaticToInstanceTestFileMigrator
}
