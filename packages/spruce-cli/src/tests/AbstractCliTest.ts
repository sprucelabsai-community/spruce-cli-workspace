import pathUtil from 'path'
import { SchemaRegistry } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { templates } from '@sprucelabs/spruce-templates'
import AbstractSpruceTest, { assert } from '@sprucelabs/test'
import fs from 'fs-extra'
import globby from 'globby'
import * as uuid from 'uuid'
import { CliBootOptions } from '../cli'
import AbstractAction from '../features/AbstractAction'
import { FeatureOptions } from '../features/AbstractFeature'
import ActionExecuter, {
	ActionExecuterOptions,
} from '../features/ActionExecuter'
import ActionFactory from '../features/ActionFactory'
import EventStore from '../features/event/stores/EventStore'
import FeatureInstaller from '../features/FeatureInstaller'
import FeatureInstallerFactory from '../features/FeatureInstallerFactory'
import { FeatureActionResponse, FeatureCode } from '../features/features.types'
import OnboardingStore from '../features/onboard/stores/OnboardingStore'
import SkillStore from '../features/skill/stores/SkillStore'
import FeatureFixture, {
	FeatureFixtureOptions,
} from '../fixtures/FeatureFixture'
import MercuryFixture from '../fixtures/MercuryFixture'
import OrganizationFixture from '../fixtures/OrganizationFixture'
import PersonFixture from '../fixtures/PersonFixture'
import SkillFixture from '../fixtures/SkillFixture'
import CliGlobalEmitter, { GlobalEmitter } from '../GlobalEmitter'
import SpyInterface from '../interfaces/SpyInterface'
import CommandService from '../services/CommandService'
import ImportService from '../services/ImportService'
import ServiceFactory, { Service, ServiceMap } from '../services/ServiceFactory'
import StoreFactory, {
	StoreCode,
	StoreFactoryMethodOptions,
	StoreFactoryOptions,
	StoreMap,
} from '../stores/StoreFactory'
import { ApiClientFactoryOptions } from '../types/apiClient.types'
import AbstractWriter from '../writers/AbstractWriter'
import WriterFactory from '../writers/WriterFactory'
import testUtil from './utilities/test.utility'

export default abstract class AbstractCliTest extends AbstractSpruceTest {
	protected static cliRoot = pathUtil.join(__dirname, '..')
	protected static homeDir: string

	private static _ui: SpyInterface
	private static emitter?: GlobalEmitter
	private static mercuryFixture?: MercuryFixture
	private static personFixture?: PersonFixture
	private static organizationFixture?: OrganizationFixture
	private static skillFixture?: SkillFixture
	private static featureInstaller?: FeatureInstaller
	private static originalEnv: { [x: string]: string | undefined }

	protected static async beforeAll() {
		await super.beforeAll()
		await this.cleanTestDirsAndFiles()

		AbstractWriter.disableLinting()

		ImportService.setCacheDir(diskUtil.createRandomTempDir())

		process.env.ENABLE_INSTALL_INTERTAINMENT = 'false'

		this.originalEnv = { ...process.env }
	}

	protected static async beforeEach() {
		await super.beforeEach()

		//@ts-ignore
		process.env = { ...this.originalEnv }

		testUtil.startLogTimer()

		SchemaRegistry.getInstance().forgetAllSchemas()

		this.cwd = this.freshTmpDir()
		this.homeDir = this.freshTmpDir()

		this.emitter = undefined
		this.featureInstaller = undefined

		OnboardingStore.overrideCwd(diskUtil.createRandomTempDir())

		this.ui.reset()
		this.ui.invocations = []
		this.ui.setCursorPosition({ x: 0, y: 0 })

		this.clearFixtures()

		ImportService.clearCache()
		SkillStore.clearCurrentSkill()
		EventStore.clearCache()
		CommandService.clearMockResponses()
	}

	protected static async afterEach() {
		await super.afterEach()

		await this.organizationFixture?.clearAllOrgs()
		await this.mercuryFixture?.disconnectAll()

		this.clearFixtures()

		if (this._ui?.isWaitingForInput()) {
			throw new Error(
				`Terminal interface is waiting for input. Make sure you are invoking this.term.sendInput() as many times as needed.`
			)
		}

		if (diskUtil.doesDirExist(this.cwd) && testUtil.shouldClearCache()) {
			diskUtil.deleteDir(this.cwd)
		}

		if (diskUtil.doesDirExist(this.homeDir) && testUtil.shouldClearCache()) {
			diskUtil.deleteDir(this.homeDir)
		}
	}

	private static async cleanTestDirsAndFiles() {
		const pattern = this.resolveTestPath('**/*.d.ts')
		const matches = await globby(pattern)

		for (const match of matches) {
			diskUtil.deleteFile(match)
		}
	}

	private static clearFixtures() {
		this.emitter = undefined
		this.mercuryFixture = undefined
		this.organizationFixture = undefined
		this.personFixture = undefined
		this.skillFixture = undefined
	}

	protected static freshTmpDir() {
		const tmpDirectory = testUtil.resolveTestDir(uuid.v4())
		fs.ensureDirSync(tmpDirectory)
		return tmpDirectory
	}

	protected static get ui() {
		if (!this._ui) {
			this._ui = new SpyInterface()
		}

		return this._ui
	}

	protected static getEmitter() {
		if (!this.emitter) {
			this.emitter = CliGlobalEmitter.Emitter()
		}
		return this.emitter
	}

	protected static resolveTestPath(...pathAfterTestDirsAndFiles: string[]) {
		return pathUtil.join(
			this.cliRoot,
			'__tests__',
			'testDirsAndFiles',
			...pathAfterTestDirsAndFiles
		)
	}

	protected static async afterAll() {
		await super.afterAll()
		if (testUtil.shouldCleanupTestSkillDirs()) {
			FeatureFixture.deleteOldSkillDirs()
		}
	}

	protected static async Cli(options?: CliBootOptions) {
		return this.FeatureFixture(options).Cli({
			cwd: this.cwd,
			homeDir: this.homeDir,
			...(options ?? {}),
		})
	}

	protected static async linkLocalPackages() {
		const fixture = this.FeatureFixture()
		await fixture.linkLocalPackages()
	}

	protected static Service<S extends Service>(
		type: S,
		cwd?: string
	): ServiceMap[S] {
		const sf = this.ServiceFactory()
		return sf.Service(cwd ?? this.cwd, type)
	}

	protected static ServiceFactory() {
		return new ServiceFactory()
	}

	protected static FeatureFixture(options?: Partial<FeatureFixtureOptions>) {
		const emitter = options?.emitter ?? this.getEmitter()

		return new FeatureFixture({
			cwd: this.cwd,
			serviceFactory: this.ServiceFactory(),
			ui: this.ui,
			emitter,
			apiClientFactory: this.MercuryFixture().getApiClientFactory(),
			featureInstaller: this.getFeatureInstaller({ emitter }),
			...options,
		})
	}

	protected static MercuryFixture() {
		if (!this.mercuryFixture) {
			this.mercuryFixture = new MercuryFixture(this.cwd, this.ServiceFactory())
		}

		return this.mercuryFixture
	}

	protected static PersonFixture() {
		if (!this.personFixture) {
			this.personFixture = new PersonFixture(
				this.MercuryFixture().getApiClientFactory()
			)
		}

		return this.personFixture
	}

	protected static async skipInstallSkill<
		E extends () => Promise<FeatureActionResponse>
	>(
		execute?: E
	): Promise<E extends undefined ? undefined : FeatureActionResponse> {
		const promise = execute?.()

		await this.waitForInput()
		await this.ui.sendInput('n')

		await this.waitForInput()
		await this.ui.sendInput('')

		const results = await promise

		return results as any
	}

	protected static OrganizationFixture() {
		if (!this.organizationFixture) {
			this.organizationFixture = new OrganizationFixture(
				this.PersonFixture(),
				this.StoreFactory()
			)
		}

		return this.organizationFixture
	}

	protected static SkillFixture() {
		if (!this.skillFixture) {
			this.skillFixture = new SkillFixture(
				this.PersonFixture(),
				this.StoreFactory(),
				this.MercuryFixture().getApiClientFactory()
			)
		}

		return this.skillFixture
	}

	protected static resolveHashSprucePath(...filePath: string[]) {
		return diskUtil.resolveHashSprucePath(this.cwd, ...filePath)
	}

	protected static getFeatureInstaller(options?: Partial<FeatureOptions>) {
		if (!this.featureInstaller) {
			const serviceFactory = this.ServiceFactory()
			const storeFactory = this.StoreFactory(options)
			const emitter = this.getEmitter()
			const apiClientFactory = this.MercuryFixture().getApiClientFactory()

			const actionExecuter = this.ActionExecuter()

			this.featureInstaller = FeatureInstallerFactory.WithAllFeatures({
				cwd: this.cwd,
				serviceFactory,
				storeFactory,
				ui: this.ui,
				emitter,
				apiClientFactory,
				actionExecuter,
				...options,
			})
		}

		return this.featureInstaller
	}

	protected static StoreFactory(options?: Partial<StoreFactoryOptions>) {
		const serviceFactory = this.ServiceFactory()

		return new StoreFactory({
			cwd: this.cwd,
			serviceFactory,
			homeDir: this.homeDir,
			apiClientFactory: this.MercuryFixture().getApiClientFactory(),
			emitter: this.getEmitter(),
			...options,
		})
	}

	protected static Store<C extends StoreCode>(
		code: C,
		options?: StoreFactoryMethodOptions
	): StoreMap[C] {
		return this.StoreFactory().Store(code, {
			cwd: this.cwd,
			...options,
		})
	}

	protected static async waitForInput() {
		const ttl = 1000 * 60 * 5
		const checkInterval = 100
		let loops = ttl / checkInterval
		let lastWriteCount = this.ui.invocations.length

		while (!this.ui.isWaitingForInput()) {
			if (loops-- === 0) {
				assert.fail(`Waiting for input timed out.`)
			}

			const hasWritten = lastWriteCount != this.ui.invocations.length

			if (hasWritten) {
				loops = ttl / checkInterval
				lastWriteCount = this.ui.invocations.length
				if (process.env.SHOULD_RENDER_TEST_LOGS === 'true') {
					testUtil.log('waitForInput timeout reset because of new output.')
				}
			}
			await new Promise((resolve) => setTimeout(resolve, checkInterval))
		}
	}

	protected static async assertIsFeatureInstalled(code: FeatureCode) {
		const featureInstaller = this.getFeatureInstaller()
		const isInstalled = await featureInstaller.isInstalled(code)

		assert.isTrue(isInstalled)
	}

	protected static async assertValidActionResponseFiles(
		results: FeatureActionResponse
	) {
		for (const file of results.files ?? []) {
			const checker = this.Service('typeChecker')
			await checker.check(file.path)
		}

		// await Promise.all(
		// 	(results.files ?? []).map((file) => {
		// 		const checker = this.Service('typeChecker')
		// 		return checker.check(file.path)
		// 	})
		// )
	}

	protected static async connectToApi(options?: ApiClientFactoryOptions) {
		return this.MercuryFixture().connectToApi(options)
	}

	protected static async openInVsCode(options?: {
		file?: string
		dir?: string
		timeout?: number
	}) {
		await this.Action('vscode', 'setup').execute({ all: true })

		await this.Service('command').execute(
			`code ${options?.file ?? options?.dir ?? this.cwd}`
		)
		await this.wait(options?.timeout ?? 99999999)
	}

	protected static log(...args: any[]) {
		testUtil.log(...args)
	}

	protected static Action<
		Action extends AbstractAction = AbstractAction,
		F extends FeatureCode = FeatureCode
	>(
		featureCode: F,
		actionCode: string,
		options?: Partial<ActionExecuterOptions>
	): Action {
		const executer = this.ActionExecuter(options).Action(
			featureCode,
			actionCode
		)

		return executer as any
	}

	protected static ActionExecuter(options?: Partial<ActionExecuterOptions>) {
		const serviceFactory = this.ServiceFactory()

		const writerFactory = new WriterFactory(
			templates,
			this.ui,
			serviceFactory.Service(this.cwd, 'lint')
		)

		const emitter = this.getEmitter()

		const actionFactory = new ActionFactory({
			writerFactory,
			ui: this.ui,
			emitter,
			apiClientFactory: this.MercuryFixture().getApiClientFactory(),
			cwd: this.cwd,
			serviceFactory,
			storeFactory: this.StoreFactory(),
			templates,
		})

		const executer = new ActionExecuter({
			ui: this.ui,
			emitter,
			actionFactory,
			featureInstallerFactory: () => {
				return this.getFeatureInstaller()
			},
			shouldAutoHandleDependencies: false,
			...options,
		})

		return executer
	}

	protected static selectOptionBasedOnLabel(label: string) {
		const last = this.ui.lastInvocation()
		assert.doesInclude(last.options.options.choices, {
			label,
		})

		const match = last.options.options.choices.find(
			(o: any) => o.label === label
		)

		void this.ui.sendInput(`${match.value}`)
	}
}
