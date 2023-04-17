import { SelectChoice } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import { FeatureCode } from '../../../features/features.types'
import CreateAction from '../../../features/test/actions/CreateAction'
import AbstractTestTest from '../../../tests/AbstractTestTest'
import testUtil from '../../../tests/utilities/test.utility'

const expectedAbstractTests = [
	'AbstractSpruceTest (default)',
	'AbstractStoreTest (requires install)',
	'AbstractViewControllerTest (requires install)',
	'AbstractSpruceFixtureTest',
	'AbstractTest',
	'AbstractTest2',
	'AbstractBananaTestDifferentThanFileName',
]

const featuresWithRegisteredTests: {
	featureCode: FeatureCode
	className: string
}[] = [
	{ featureCode: 'store', className: 'AbstractStoreTest' },
	{ featureCode: 'view', className: 'AbstractViewControllerTest' },
]

export default class SelectingAnAbstractTestClassTest extends AbstractTestTest {
	@test()
	protected static async asksForYouToSelectABaseClass() {
		const { promise } = await this.installCopyTestFilesSelectLocalAbstractTest()

		const results = await promise

		testUtil.assertFileByNameInGeneratedFiles(
			'CanBookAppointment.test.ts',
			results.files
		)

		await this.buildAndAssertTestFailsAsExpected()
	}

	@test()
	protected static async canSelectAbstractClassWhileSelectingSubDir() {
		const testDir = this.resolvePath('src', '__tests__', 'behavioral', 'taco')

		diskUtil.createDir(testDir)

		await this.installAndCopyTestFiles()

		const { promise } = await this.invokeCreateActionAndWaitForInput()

		await this.ui.sendInput({ path: 'taco' })
		await this.waitForInput()

		this.selectOptionBasedOnLabel('AbstractBananaTestDifferentThanFileName')

		await promise

		await this.buildAndAssertTestFailsAsExpected()
	}

	@test()
	protected static async canSelectAbstractTestBasedOnEventEmitter() {
		const cli = await this.installTests()
		void cli.on('test.register-abstract-test-classes', async () => {
			return {
				abstractClasses: [
					{
						name: 'TestClass',
						label: 'TestClass',
						import: '@sprucelabs/another-lib',
					},
					{
						name: 'TestClass2',
						label: 'TestClass2',
						import: '@sprucelabs/another-lib',
					},
				],
			}
		})

		const { choices, promise } =
			await this.executeCreateUntilAbstractClassSelection()

		assert.doesInclude(choices, {
			label: 'TestClass',
		})

		assert.doesInclude(choices, {
			label: 'TestClass2',
		})

		this.selectOptionBasedOnLabel('TestClass2')

		const results = await promise

		assert.isFalsy(results.errors)

		const match = testUtil.assertFileByNameInGeneratedFiles(
			'CanBookAppointment.test.ts',
			results.files
		)

		const contents = diskUtil.readFile(match)

		assert.doesInclude(
			contents,
			"import { TestClass2 } from '@sprucelabs/another-lib'"
		)

		assert.doesInclude(contents, 'extends TestClass2')
	}

	@test()
	protected static async installingAFeatureRemovesLabelFromName() {
		this.commandFaker.fakeInstall()

		await this.installTests()

		const testFeature = this.featureInstaller.getFeature('test')

		for (const feat of featuresWithRegisteredTests) {
			await this.featureInstaller.install({
				features: [
					{
						//@ts-ignore
						code: feat.featureCode,
					},
				],
			})

			const candidates = await testFeature.buildParentClassCandidates()

			assert.isTruthy(
				candidates.find(({ name }) => {
					return name === feat.className
				})
			)
		}
	}

	@test()
	protected static async selectingUninstalledTestInstallsTheFeature() {
		this.commandFaker.fakeInstall()

		for (const feat of featuresWithRegisteredTests) {
			this.cwd = diskUtil.createRandomTempDir()
			await this.installTests()

			const { choices, promise } =
				await this.executeCreateUntilAbstractClassSelection()

			const match = choices.find((c: any) => c.label.includes(feat.className))

			assert.isTruthy(match)

			let isInstalled = await this.featureInstaller.isInstalled(
				feat.featureCode as any
			)
			assert.isFalse(isInstalled)

			await this.ui.sendInput(match?.value)

			await promise

			isInstalled = await this.featureInstaller.isInstalled(
				feat.featureCode as any
			)
			assert.isTrue(isInstalled)
		}
	}

	@test()
	protected static relativePathsAddDotSlash() {
		const action = this.Action('test', 'create') as CreateAction

		//@ts-ignore
		const actual = action.buildParentClassFromCandidate(
			{
				label: 'test',
				name: 'AbstractTest',
				path: this.resolvePath('test/AbstractTest'),
				isDefaultExport: false,
			},
			this.resolvePath('test')
		)

		assert.isEqual(actual.importPath, './AbstractTest')
	}

	private static async buildAndAssertTestFailsAsExpected() {
		await this.Service('build').build()

		await assert.doesThrowAsync(
			() => this.Service('command').execute('yarn test'),
			/false.*?does not equal.*?true/gis
		)
	}

	private static async installCopyTestFilesSelectLocalAbstractTest() {
		await this.installAndCopyTestFiles()

		const { choices, promise } =
			await this.executeCreateUntilAbstractClassSelection()

		for (const expected of expectedAbstractTests) {
			assert.doesInclude(choices, { label: expected })
		}

		this.selectOptionBasedOnLabel('AbstractBananaTestDifferentThanFileName')

		return { promise }
	}

	private static async installAndCopyTestFiles() {
		await this.installTests()
		await this.copyTestFiles()
	}

	private static async copyTestFiles() {
		const source = this.resolveTestPath('abstract_tests')
		const destination = this.resolvePath('src')

		await diskUtil.copyDir(source, destination)
	}

	private static async executeCreateUntilAbstractClassSelection() {
		const { promise } = await this.invokeCreateActionAndWaitForInput()

		const last = this.ui.getLastInvocation()
		const { choices } = last.options.options ?? {}

		return { promise, choices } as {
			promise: Promise<any>
			choices: SelectChoice[]
		}
	}

	private static async invokeCreateActionAndWaitForInput() {
		const promise = this.Action('test', 'create').execute({
			type: 'behavioral',
			nameReadable: 'Can book appointment',
			nameCamel: 'canBookAppointment',
		})

		await this.waitForInput()
		return { promise }
	}
}
