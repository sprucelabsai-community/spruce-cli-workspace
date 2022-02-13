import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import LintService from '../../../services/LintService'
import AbstractTestTest from '../../../tests/AbstractTestTest'
import testUtil from '../../../tests/utilities/test.utility'
import uiAssert from '../../../tests/utilities/uiAssert.utility'

export default class CreatingBehavioralTestsTest extends AbstractTestTest {
	@test()
	protected static async hasCreateAction() {
		assert.isFunction(this.Action('test', 'create').execute)
	}

	@test()
	protected static async requiresInstallIfFeatureNotInstalled() {
		await this.installTests('testsInNodeModule')

		const testFeature = this.getFeatureInstaller().getFeature('test')
		const candidates = await testFeature.buildParentClassCandidates()

		assert.doesInclude(candidates, {
			label: 'AbstractSpruceFixtureTest (requires install)',
			name: 'AbstractSpruceFixtureTest',
		})
	}

	@test(
		'can create behavioral test with AbstractSpruceFixtureTest',
		'AbstractSpruceFixtureTest'
	)
	@test(
		'can create behavioral test with AbstractStoreTest',
		'AbstractStoreTest (requires install)'
	)
	protected static async canCreateBehavioralTest(testName: string) {
		LintService.enableLinting()
		const { promise } = await this.installAndStartTestActionAndWaitForInput()

		this.selectOptionBasedOnLabel(testName)

		const response = await promise

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'CanBookAppointment.test.ts',
			response.files
		)

		assert.doesInclude(match, 'behavioral')

		await this.Service('build').build()

		await assert.doesThrowAsync(
			() => this.Service('command').execute('yarn test'),
			/false.*?does not equal.*?true/gis
		)
	}

	@test('finds folders inside behavioral', 'behavioral')
	@test('finds folders inside implementation', 'implementation')
	protected static async promptsToSelectFolderIfInsideTestDir(
		testType: string
	) {
		await this.installTests()

		this.createTestSubDir(testType, 'dummy1')

		const { promise } = await this.installAndStartTestActionAndWaitForInput(
			testType
		)

		uiAssert.assertSelectRenderChoice(this.ui, '.', testType)
		uiAssert.assertSelectRenderChoice(this.ui, `dummy1`, `${testType}/dummy1`)

		await this.ui.sendInput('.')
		await this.waitAndSelectSubClass()

		await promise
	}

	@test()
	protected static async listsManyDirsIfExistInsideTestDir() {
		await this.installTests()

		const dirs = ['dir1', 'dir2', 'dir3']

		for (const dir of dirs) {
			this.createTestSubDir('behavioral', dir)
		}

		const { promise } = await this.installAndStartTestActionAndWaitForInput()

		for (const dir of dirs) {
			uiAssert.assertSelectRenderChoice(this.ui, `${dir}`, `behavioral/${dir}`)
		}

		await this.ui.sendInput('.')

		await this.waitAndSelectSubClass()

		await promise
	}

	@test('can select subdir 1', 'test')
	@test('can select subdir 2', 'test-2')
	protected static async selectingAnOptionRendersToSubDir(dirName: string) {
		await this.installTests()
		this.createTestSubDir('behavioral', dirName)

		const { promise } = await this.installAndStartTestActionAndWaitForInput(
			'behavioral'
		)

		await this.ui.sendInput(`${dirName}`)

		await this.waitAndSelectSubClass()

		const results = await promise

		const expectedPath = this.resolvePath(
			'src',
			'__tests__',
			'behavioral',
			dirName,
			'CanBookAppointment.test.ts'
		)

		assert.isEqual(expectedPath, results.files?.[0]?.path)
	}

	@test()
	protected static async doesNotListFiles() {
		await this.installTests()
		this.createTestSubDir('behavioral', 'subdir')

		const file = this.resolveTestDir('behavioral', 'test.ts')
		diskUtil.writeFile(file, 'what the!?')

		await this.installAndStartTestActionAndWaitForInput()

		uiAssert.assertSelectDidNotRenderChoice(
			this.ui,
			'test',
			`behavioral/test/test.ts`
		)

		this.ui.reset()
	}

	private static createTestSubDir(...testDirs: string[]) {
		const newDir = this.resolveTestDir(...testDirs)
		diskUtil.createDir(newDir)
	}

	private static resolveTestDir(...testDirs: string[]) {
		return this.resolvePath('src', '__tests__', ...testDirs)
	}

	private static async installAndStartTestActionAndWaitForInput(
		testType = 'behavioral'
	) {
		await this.installTests()
		const promise = this.Action('test', 'create').execute({
			type: testType,
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
			namePascal: 'CanBookAppointment',
		})

		await this.waitForInput()
		return { promise }
	}

	private static async waitAndSelectSubClass(selectedSubClass?: string) {
		await this.waitForInput()
		await this.ui.sendInput(selectedSubClass ?? '')
	}
}
