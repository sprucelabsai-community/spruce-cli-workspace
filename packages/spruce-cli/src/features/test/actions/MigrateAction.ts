import { buildSchema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import StaticTestFinderImpl from '../../../tests/staticToInstanceMigration/StaticTestFinder'
import StaticToInstanceMigratorImpl from '../../../tests/staticToInstanceMigration/StaticToInstanceMigrator'
import StaticToInstanceTestFileMigratorImpl from '../../../tests/staticToInstanceMigration/StaticToInstanceTestFileMigrator'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class MigrationAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public commandAliases = ['migrate.tests']
    public invocationMessage = 'Migrating tests from static to instance... 🌲'

    public async execute(): Promise<FeatureActionResponse> {
        const testFinder = StaticTestFinderImpl.Finder()
        const testFileMigrator = StaticToInstanceTestFileMigratorImpl.Migrator()
        const migrator = StaticToInstanceMigratorImpl.Migrator({
            testFinder,
            testFileMigrator,
        })

        const path = diskUtil.resolvePath(this.cwd, 'src', '__tests__')
        const { totalTestsSkipped, totalTestsUpdated } =
            await migrator.run(path)

        return {
            headline: 'Migrated tests from static to instance based.',
            summaryLines: [
                `${totalTestsUpdated} test${totalTestsUpdated === 1 ? '' : 's'} updated`,
                `${totalTestsSkipped} test${totalTestsSkipped === 1 ? '' : 's'} skipped`,
            ],
        }
    }
}

const optionsSchema = buildSchema({
    id: 'migrateTests',
    fields: {},
})

type OptionsSchema = typeof optionsSchema
