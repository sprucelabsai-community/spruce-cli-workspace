import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { FeatureActionResponse } from '../../../features/features.types'
import { CreateViewOptions } from '../../../features/view/actions/CreateAction'
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
        await this.createCardViewController('test')
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

    @test()
    protected static async alwaysRendersCombinedViewsFileAlphabetically() {
        await this.createCardViewController('apple bottom')
        await this.createCardViewController('banana bottom')
        await this.createCardViewController('zebra tooshie')

        const contents = this.readCombinedViewsFile()

        const vcsExpeced = `{
    AppleBottomViewController,
    BananaBottomViewController,
    RootSkillViewController,
    TestViewController,
    ZebraTooshieViewController,
}`

        assert.doesInclude(
            contents,
            vcsExpeced,
            'views.ts vcs = {} out of order'
        )

        const viewControllerMapExpected = `'testing-views.apple-bottom': AppleBottomViewController
		'testing-views.banana-bottom': BananaBottomViewController
		'testing-views.root': RootSkillViewController
		'testing-views.test': TestViewController
		'testing-views.zebra-tooshie': ZebraTooshieViewController`

        assert.doesInclude(
            contents,
            viewControllerMapExpected,
            'views.ts viewControllerMap out of order'
        )

        const viewControllerOptionsMapExpected = `'testing-views.apple-bottom': ConstructorParameters<typeof AppleBottomViewController>[0]
		'testing-views.banana-bottom': ConstructorParameters<typeof BananaBottomViewController>[0]
		'testing-views.test': ConstructorParameters<typeof TestViewController>[0]
		'testing-views.zebra-tooshie': ConstructorParameters<typeof ZebraTooshieViewController>[0]`

        assert.doesInclude(
            contents,
            viewControllerOptionsMapExpected,
            'views.ts viewControllerOptionsMap out of order'
        )
    }

    @test()
    protected static async sortsSkillViewsAlphabetically() {
        await this.create({
            viewType: 'skillView',
            nameReadable: 'Cheesey',
            isRoot: false,
        })

        const skillViewControllerMapExpected = `'testing-views.cheesey': CheeseySkillViewController
		'testing-views.root': RootSkillViewController`

        const contents = this.readCombinedViewsFile()

        assert.doesInclude(
            contents,
            skillViewControllerMapExpected,
            'views.ts skillViewControllerMap out of order'
        )
    }

    private static readCombinedViewsFile() {
        return diskUtil.readFile(this.resolvePath('src/.spruce/views/views.ts'))
    }

    private static async createCardViewController(name: string) {
        const options = {
            viewType: 'view',
            nameReadable: name,
            viewModel: 'Card',
        }
        const results = await this.create(options)

        await this.assertValuedViewsFile(results)
    }

    private static async create(options: CreateViewOptions) {
        const results = await this.Action('view', 'create').execute(options)
        assert.isFalsy(results.errors)
        return results
    }

    private static async assertValuedViewsFile(results: FeatureActionResponse) {
        const match = testUtil.assertFileByPathInGeneratedFiles(
            `views/views.ts`,
            results.files
        )

        await this.Service('typeChecker').check(match)
    }
}
