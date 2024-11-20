import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, errorAssert, generateId } from '@sprucelabs/test-utils'
import CreateAppAction from '../../../features/view/actions/CreateAppAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'
import testUtil from '../../../tests/utilities/test.utility'

export default class CreatingAnAppControllerTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'
    private static acPath: string
    private static skillNamespace = generateId().replace(/\d/g, '')

    private static action: CreateAppAction
    private static lastExecution: {
        actionCode: string
        featureCode: string
    }[] = []

    protected static async beforeAll(): Promise<void> {
        await super.beforeAll()
        this.acPath = this.resolvePath('src/App.ac.ts')
        const pgk = this.Service('pkg')
        pgk.set({ path: 'skill.namespace', value: this.skillNamespace })
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

        testUtil.assertFileByPathInGeneratedFiles(this.acPath, results.files)

        assert.doesInclude(results.files, {
            action: 'generated',
            name: 'App.ac.ts',
            path: this.acPath,
        })

        assert.doesInclude(results.files, {
            action: 'generated',
            name: 'views.ts',
            path: this.combinedViewsPath,
        })
    }

    @test()
    protected static async syncsViewsOnCreation() {
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
    protected static async acIncludesExpectedContents() {
        const contents = diskUtil.readFile(this.acPath)
        assert.doesInclude(
            contents,
            'export default class AppControllerImpl extends AbstractAppController'
        )

        assert.doesInclude(
            contents,
            'public async load(_options: AppControllerLoadOptions)'
        )
    }

    @test()
    protected static async generatedFilesAreValid() {
        await this.Service('typeChecker').check(this.acPath)
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
            'heartwood({ vcs, pluginsByName, App: AppControllerImpl })'
        )
    }

    @test()
    protected static async combineViewsTypesAsExpected() {
        const expected = `interface AppControllerMap {
        '${this.skillNamespace}' : AppControllerImpl
}`

        this.assertCombinedViewsContains(expected)
    }

    @test()
    protected static async throwsEvenIfAppMoves() {
        const destination = this.resolvePath(`src/${generateId()}/App.ac.ts`)
        diskUtil.moveFile(this.acPath, destination)

        await this.executeAndAssertThrowsAvcExists()
        this.acPath = destination
    }

    @test()
    protected static async canRenameAppAndItUpdatesCombinedViews() {
        const contents = diskUtil.readFile(this.acPath)
        const updatedContents = contents.replace(
            'AppControllerImpl',
            'NewAppControllerImpl'
        )
        diskUtil.writeFile(this.acPath, updatedContents)
        await this.Action('view', 'sync').execute({})

        this.assertCombinedViewsContains(
            'heartwood({ vcs, pluginsByName, App: NewAppControllerImpl })'
        )

        await this.assertCombinedViewsFileIsValid()
    }

    @test()
    protected static async importsAppFromCombinedViews() {
        const testScript =
            `import { App } from '#` +
            `spruce/views/views'
const app = new App({} as any)
console.log(app)
if (App.id !== '${this.skillNamespace}') {
        throw new Error('App.id is not correct')
}`

        const testScriptPath = this.resolvePath('src/test.ts')
        diskUtil.writeFile(testScriptPath, testScript)

        await this.Service('typeChecker').check(testScriptPath)
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
            'APP_CONTROLLER_ALREADY_EXISTS'
        )
    }

    private static async execute() {
        return await this.action.execute()
    }
}
