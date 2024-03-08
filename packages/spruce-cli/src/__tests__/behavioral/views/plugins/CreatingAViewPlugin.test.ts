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

	@test('creates expected plugin file 1', 'test', 'test')
	@test('creates expected plugin file 2', 'another', 'another')
	@test('creates expected plugin file 3', 'a third', 'aThird')
	protected static async createsExpectedFile(
		readable: string,
		expected: string
	) {
		const results = await this.execute({ nameReadable: readable })
		this.assertExpectedFileCreated(results, expected)
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

		this.assertExpectedFileCreated(results, 'testCamel')
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

	private static assertPluginContentsEqualExpected(
		nameCamel: string,
		namePascal: string
	) {
		const contents = diskUtil.readFile(this.buildPathToViewPlugin(nameCamel))
		const expected = `export default class ${namePascal}ViewPlugin {}

declare module '@sprucelabs/heartwood-view-controllers/build/types/heartwood.types' {
	interface ViewControllerPlugins {
		${nameCamel}: ${namePascal}ViewPlugin
	}
}`

		assert.isEqual(contents.trim(), expected.trim())
	}

	private static async assertThrowsAlreadyExists(name: string) {
		const results = await this.execute({ nameReadable: name })
		assert.isTruthy(results.errors)
		errorAssert.assertError(results.errors[0], 'VIEW_PLUGIN_ALREADY_EXISTS', {
			name,
		})
	}

	private static assertViewPluginWritten(name: string) {
		const path = this.buildPathToViewPlugin(name)
		assert.isTrue(diskUtil.doesFileExist(path), `File ${path} was not written!`)
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
		expected: string
	) {
		const expectedName = `${expected}.view.plugin.ts`
		assert.doesInclude(results.files?.[0], {
			action: 'generated',
			name: expectedName,
			path: this.resolvePath('src', 'viewPlugins', expectedName),
		})
	}
}
