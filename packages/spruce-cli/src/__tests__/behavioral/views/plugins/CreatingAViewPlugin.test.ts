import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert, errorAssert } from '@sprucelabs/test-utils'
import { FeatureActionResponse } from '../../../../features/features.types'
import CreatePluginAction from '../../../../features/view/actions/CreatePluginAction'
import AbstractSkillTest from '../../../../tests/AbstractSkillTest'

export default class CreatingAViewPluginTest extends AbstractSkillTest {
    protected static skillCacheKey = 'views'
    private static action: CreatePluginAction

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()
        this.action = this.Action('view', 'createPlugin')
    }

    @test()
    protected static async hasAction() {
        assert.isFunction(this.action.execute)
    }

    @test('creates expected plugin file 1', 'test', 'test', 'updated')
    @test('creates expected plugin file 2', 'another', 'another', 'updated')
    @test('creates expected plugin file 3', 'a third', 'aThird', 'generated')
    protected static async createsExpectedFile(
        readable: string,
        expected: string,
        combinedViewAction: string
    ) {
        const results = await this.execute({ nameReadable: readable })
        this.assertExpectedFileCreated(results, expected, combinedViewAction)
        assert.isFalsy(
            results.errors,
            'Errors were returned and none were expected!'
        )
    }

    @test()
    protected static async usesCamelNameIfProvided() {
        const results = await this.execute({
            nameReadable: 'test',
            nameCamel: 'testCamel',
        })

        this.assertExpectedFileCreated(results, 'testCamel', 'updated')
    }

    @test()
    protected static async actuallyCreatesFile() {
        this.assertViewPluginWritten('test')
        this.assertViewPluginWritten('another')
        this.assertViewPluginWritten('aThird')
    }

    @test()
    protected static async throwsIfPluginAlreadyExists() {
        await this.assertThrowsAlreadyExists('test')
        await this.assertThrowsAlreadyExists('another')
    }

    @test()
    protected static async contentsAreEqualToExpected() {
        this.assertPluginContentsEqualExpected('test', 'Test')
        this.assertPluginContentsEqualExpected('another', 'Another')
        this.assertPluginContentsEqualExpected('aThird', 'AThird')
    }

    @test()
    protected static async combineViewsFileIsValid() {
        const combined = this.getPathToCombinedViewsFile()
        await this.Service('typeChecker').check(combined)
    }

    @test()
    protected static async updatesViewCombinedFileWithTypesAsExpected() {
        const expected = `	interface ViewControllerPlugins {
		aThird: AThirdViewPlugin
		another: AnotherViewPlugin
		test: TestViewPlugin
		testCamel: TestCamelViewPlugin
	}`
        this.assertCombinedFileIncludes(expected)
    }

    @test()
    protected static async updatesViewCombinedWithPluginsAsExpected() {
        const expected = `export const pluginsByName = {
	aThird: AThirdViewPlugin,
	another: AnotherViewPlugin,
	test: TestViewPlugin,
	testCamel: TestCamelViewPlugin,
}
`

        this.assertCombinedFileIncludes(expected)
        this.assertCombinedFileIncludes('heartwood({ vcs, pluginsByName })')
    }

    @test()
    protected static async viewPluginCanImportAnotherViewPlugin() {
        this.writeFile('export class ExternalViewPlugin {}', 'external.ts')
        this.writeFile(
            `export { ExternalViewPlugin as default } from './external'`,
            'actual.view.plugin.ts'
        )

        await this.syncViews()

        const expected = `export const pluginsByName = {
	actual: ExternalViewPlugin,
	aThird: AThirdViewPlugin,
	another: AnotherViewPlugin,
	test: TestViewPlugin,
	testCamel: TestCamelViewPlugin,
}
`

        this.assertCombinedFileIncludes(expected)
    }

    @test()
    protected static async canImportPluginFromExternalLibrary() {
        this.writeFile(
            "export { CardViewController as default } from '@sprucelabs/heartwood-view-controllers'",
            'card.view.plugin.ts'
        )

        await this.syncViews()

        const expected = `export const pluginsByName = {
	actual: ExternalViewPlugin,
	card: CardViewController,
	aThird: AThirdViewPlugin,
	another: AnotherViewPlugin,
	test: TestViewPlugin,
	testCamel: TestCamelViewPlugin,
}
`
        this.assertCombinedFileIncludes(expected)
    }

    private static async syncViews() {
        await this.Action('view', 'sync').execute({})
    }

    private static writeFile(content: string, fileName: string) {
        const actualPlugiContent = content
        const actualDestination = this.resolvePath('src', fileName)
        diskUtil.writeFile(actualDestination, actualPlugiContent)
    }

    private static assertCombinedFileIncludes(expected: string) {
        const combined = this.getPathToCombinedViewsFile()
        const contents = diskUtil.readFile(combined)
        assert.doesInclude(contents, expected)
    }

    private static assertPluginContentsEqualExpected(
        nameCamel: string,
        namePascal: string
    ) {
        const contents = diskUtil.readFile(
            this.buildPathToViewPlugin(nameCamel)
        )
        const expected = `import { ViewControllerPlugin } from '@sprucelabs/heartwood-view-controllers'\n\nexport default class ${namePascal}ViewPlugin implements ViewControllerPlugin {}`

        assert.isEqual(contents.trim(), expected.trim())
    }

    private static async assertThrowsAlreadyExists(name: string) {
        const results = await this.execute({ nameReadable: name })
        assert.isTruthy(results.errors)
        errorAssert.assertError(
            results.errors[0],
            'VIEW_PLUGIN_ALREADY_EXISTS',
            {
                name,
            }
        )
    }

    private static assertViewPluginWritten(name: string) {
        const path = this.buildPathToViewPlugin(name)
        assert.isTrue(
            diskUtil.doesFileExist(path),
            `File ${path} was not written!`
        )
    }

    private static buildPathToViewPlugin(name: string) {
        return this.resolvePath('src', 'viewPlugins', `${name}.view.plugin.ts`)
    }

    private static async execute(options: {
        nameReadable: string
        nameCamel?: string
    }) {
        return await this.action.execute(options)
    }

    private static assertExpectedFileCreated(
        results: FeatureActionResponse,
        expected: string,
        combinedViewAction: string
    ) {
        const expectedName = `${expected}.view.plugin.ts`

        assert.doesInclude(results.files?.[0], {
            action: 'generated',
            name: expectedName,
            path: this.resolvePath('src', 'viewPlugins', expectedName),
        })

        assert.doesInclude(results.files?.[1], {
            action: combinedViewAction,
            name: 'views.ts',
            path: this.getPathToCombinedViewsFile(),
        })
    }

    private static getPathToCombinedViewsFile() {
        return this.resolveHashSprucePath('views', 'views.ts')
    }
}
