import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { FeatureActionResponse } from '../../../features/features.types'
import SyncAction from '../../../features/view/actions/SyncAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class KeepingViewsInSyncTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'
    private static action: SyncAction

    protected static async beforeEach() {
        await super.beforeEach()
        this.action = this.Action('view', 'sync')
    }

    @test()
    protected static async hasSyncAction() {
        assert.isFunction(this.action.execute)
    }

    @test()
    protected static async syncingWithNoViewsGeneratesNothing() {
        const results = await this.action.execute()
        assert.isFalsy(results.errors)
        assert.isFalsy(results.files)
    }

    @test()
    protected static async createsValidCombinedEventsFileWhenCreatingANewSvc() {
        const results = await this.Action('view', 'create').execute({
            viewType: 'skillView',
            isRoot: true,
        })

        await this.assertValuedViewsFile(results)
    }

    @test()
    protected static async generatesValidTypesFileWithNoSkillViews() {
        const results = await this.Action('view', 'create').execute({
            viewType: 'view',
            nameReadable: 'test',
            viewModel: 'Card',
        })
        assert.isFalsy(results.errors)
        await this.assertValuedViewsFile(results)
    }

    @test()
    protected static async exportUndefinedApp() {
        const testScript =
            `import { App } from '#` +
            `spruce/views/views'
        if (App !== undefined) {
            throw new Error('App should be undefined')
        }`

        const testScriptPath = this.resolvePath('src/test.ts')
        diskUtil.writeFile(testScriptPath, testScript)

        await this.Service('typeChecker').check(testScriptPath)
    }

    private static async assertValuedViewsFile(results: FeatureActionResponse) {
        const match = testUtil.assertFileByPathInGeneratedFiles(
            `views/views.ts`,
            results.files
        )

        await this.Service('typeChecker').check(match)
    }
}
