import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
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

		const testFeature = this.featureInstaller.getFeature('test')
		const candidates = await testFeature.buildParentClassCandidates()

		assert.doesInclude(candidates, {
			label: 'AbstractStoreTest (requires install)',
			name: 'AbstractStoreTest',
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
		const match = await this.createTestAndGetFile(testName)

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

		const { promise } =
			await this.installAndStartTestActionAndWaitForInput(testType)

		uiAssert.assertRendersDirectorySelect(
			this.ui,
			this.resolvePath('src', '__tests__', testType)
		)

		await this.ui.sendInput('')
		await this.waitAndSelectSubClass()

		await promise
	}

	@test('can select sub dir 1', 'test')
	@test('can select sub dir 2', 'test-2')
	protected static async selectingAnOptionRendersToSubDir(dirName: string) {
		await this.installTests()
		const dir = this.createTestSubDir('behavioral', dirName)

		const { promise } =
			await this.installAndStartTestActionAndWaitForInput('behavioral')

		await this.ui.sendInput({ path: dir })

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
	protected static async allTestsComeFakedToStart() {
		const testFile = await this.createTestAndGetFile()
		const contents = diskUtil.readFile(testFile)
		assert.doesInclude(contents, 'fake.login()')
	}

	private static createTestSubDir(...testDirs: string[]) {
		const newDir = this.resolveTestDir(...testDirs)
		diskUtil.createDir(newDir)
		return newDir
	}

	private static resolveTestDir(...testDirs: string[]) {
		return this.resolvePath('src', '__tests__', ...testDirs)
	}

	private static async createTest(testName = 'AbstractSpruceFixtureTest') {
		const { promise } = await this.installAndStartTestActionAndWaitForInput()

		this.selectOptionBasedOnLabel(testName)

		const response = await promise
		return response
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

	private static async createTestAndGetFile(testName?: string) {
		const response = await this.createTest(testName)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'CanBookAppointment.test.ts',
			response.files
		)
		return match
	}
}
