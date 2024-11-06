import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, errorAssert, generateId } from '@sprucelabs/test-utils'
import CreateAppAction from '../../../features/view/actions/CreateAppAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingAnAppViewControllerTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'
    private static avcPath: string

    private static action: CreateAppAction
    private static lastExecution: {
        actionCode: string
        featureCode: string
    }[] = []

    protected static async beforeAll(): Promise<void> {
        await super.beforeAll()
        this.avcPath = this.resolvePath('src/App.avc.ts')
    }

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()

        this.action = this.Action('view', 'createApp')
        await this.cli.on('feature.will-execute', (payload) => {
            this.lastExecution.push(payload)
        })
    }

    @test()
    protected static async generatesExpectedFile() {
        const results = await this.execute()
        assert.isFalsy(results.errors)

        testUtil.assertFileByPathInGeneratedFiles(this.avcPath, results.files)

        assert.doesInclude(results.files, {
            action: 'generated',
            name: 'App.avc.ts',
            path: this.avcPath,
        })

        assert.doesInclude(results.files, {
            action: 'generated',
            name: 'views.ts',
            path: this.combinedViewsPath,
        })
    }

    @test()
    protected static async syncsViewsOnCreation() {
        debugger
        assert.doesInclude(this.lastExecution, {
            actionCode: 'sync',
            featureCode: 'view',
        })
        assert.isEqual(this.lastExecution[1].actionCode, 'sync')
        assert.isTrue(
            diskUtil.doesFileExist(this.combinedViewsPath),
            'views.ts does not exist'
        )
    }

    @test()
    protected static async throwsIfAppAlreadyExists() {
        await this.executeAndAssertThrowsAvcExists()
    }

    @test()
    protected static async avcIncludesExpectedContents() {
        const contents = diskUtil.readFile(this.avcPath)
        assert.doesInclude(
            contents,
            'export default class AppViewControllerImpl extends AbstractAppViewController'
        )

        assert.doesInclude(
            contents,
            'public async (_options: AppViewControllerLoadOptions)'
        )
    }

    @test()
    protected static async generatedFilesAreValid() {
        await this.Service('typeChecker').check(this.avcPath)
        await this.assertCombinedViewsFileIsValid()
    }

    @test()
    protected static async doesNotDropAppIntoSkillViewTypes() {
        const expected = `interface ViewControllerMap {}`
        this.assertCombinedViewsContains(expected)
    }

    @test()
    protected static async callsHeartwoodImportFunctionAsExpected() {
        this.assertCombinedViewsContains(
            'heartwood({ vcs, pluginsByName, App: AppViewControllerImpl })'
        )
    }

    @test()
    protected static async throwsEvenIfAppAvcMoves() {
        const destination = this.resolvePath(`src/${generateId()}/App.avc.ts`)
        diskUtil.moveFile(this.avcPath, destination)

        await this.executeAndAssertThrowsAvcExists()
        this.avcPath = destination
    }

    @test()
    protected static async canRenameAppAvcAndItUpdatesCombinedViews() {
        const contents = diskUtil.readFile(this.avcPath)
        const updatedContents = contents.replace(
            'AppViewControllerImpl',
            'NewAppViewControllerImpl'
        )
        diskUtil.writeFile(this.avcPath, updatedContents)
        await this.Action('view', 'sync').execute({})

        this.assertCombinedViewsContains(
            'heartwood({ vcs, pluginsByName, App: NewAppViewControllerImpl })'
        )

        await this.assertCombinedViewsFileIsValid()
    }

    private static async assertCombinedViewsFileIsValid() {
        await this.Service('typeChecker').check(this.combinedViewsPath)
    }

    private static assertCombinedViewsContains(expected: string) {
        const contents = diskUtil.readFile(this.combinedViewsPath)
        assert.doesInclude(
            contents.replace(/\s/g, ''),
            expected.replace(/\s/g, ''),
            `The combined views file does not include the expected contents.`
        )
    }

    private static get combinedViewsPath() {
        return this.resolveHashSprucePath('views', 'views.ts')
    }

    private static async executeAndAssertThrowsAvcExists() {
        const results = await this.execute()
        assert.isTruthy(results.errors)
        errorAssert.assertError(
            results.errors[0],
            'APP_VIEW_CONTROLLER_ALREADY_EXISTS'
        )
    }

    private static async execute() {
        return await this.action.execute()
    }
}
