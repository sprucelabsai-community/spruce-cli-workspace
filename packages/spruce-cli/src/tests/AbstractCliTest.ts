import pathUtil from 'path'
import globby from '@sprucelabs/globby'
import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { SchemaRegistry } from '@sprucelabs/schema'
import { AuthService, diskUtil } from '@sprucelabs/spruce-skill-utils'
import { templates } from '@sprucelabs/spruce-templates'
import AbstractSpruceTest, { assert } from '@sprucelabs/test-utils'
import fs from 'fs-extra'
import * as uuid from 'uuid'
import EventFaker from '../__tests__/support/EventFaker'
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
import SkillStoreImpl from '../features/skill/stores/SkillStore'
import CliGlobalEmitter, { GlobalEmitter } from '../GlobalEmitter'
import SpyInterface from '../interfaces/SpyInterface'
import CommandServiceImpl from '../services/CommandService'
import ImportService from '../services/ImportService'
import LintService from '../services/LintService'
import ServiceFactory, { Service, ServiceMap } from '../services/ServiceFactory'
import StoreFactory, {
    StoreCode,
    CreateStoreOptions,
    StoreFactoryOptions,
    StoreMap,
} from '../stores/StoreFactory'
import { ApiClientFactoryOptions } from '../types/apiClient.types'
import { CliBootOptions, OptionOverrides } from '../types/cli.types'
import WriterFactory from '../writers/WriterFactory'
import CommandFaker from './CommandFaker'
import FeatureFixture, {
    FeatureFixtureOptions,
} from './fixtures/FeatureFixture'
import MercuryFixture from './fixtures/MercuryFixture'
import OrganizationFixture from './fixtures/OrganizationFixture'
import PersonFixture from './fixtures/PersonFixture'
import SkillFixture from './fixtures/SkillFixture'
import ViewFixture from './fixtures/ViewFixture'
import testUtil from './utilities/test.utility'

export default abstract class AbstractCliTest extends AbstractSpruceTest {
    protected static cliRoot = pathUtil.join(__dirname, '..')
    protected static homeDir: string
    protected static commandFaker: CommandFaker

    private static _ui: SpyInterface
    private static _emitter?: GlobalEmitter
    private static mercuryFixture?: MercuryFixture
    private static personFixture?: PersonFixture
    private static organizationFixture?: OrganizationFixture
    private static skillFixture?: SkillFixture
    private static _featureInstaller?: FeatureInstaller
    private static viewFixture?: ViewFixture
    private static originalEnv: Record<string, string | undefined>
    private static _writers?: WriterFactory
    protected static eventFaker: EventFaker

    protected static async beforeAll() {
        await super.beforeAll()
        await this.cleanTestDirsAndFiles()

        LintService.disableLinting()
        ServiceFactory.reset()
        WriterFactory.reset()

        ImportService.setCacheDir(diskUtil.createRandomTempDir())
        ImportService.enableCaching()

        this.eventFaker = new EventFaker()

        process.env.ENABLE_INSTALL_ENTERTAINMENT = 'false'

        this.originalEnv = { ...process.env }
    }

    protected static async beforeEach() {
        await super.beforeEach()

        delete this._writers

        ActionFactory.clearActionOverrides()

        //@ts-ignore
        process.env = { ...this.originalEnv }

        testUtil.startLogTimer()

        SchemaRegistry.getInstance().forgetAllSchemas()

        this.cwd = this.freshTmpDir()
        this.homeDir = this.freshTmpDir()

        AuthService.homeDir = this.homeDir

        this._emitter = undefined
        this._featureInstaller = undefined

        OnboardingStore.overrideCwd(diskUtil.createRandomTempDir())

        this.ui.reset()
        this.ui.invocations = []
        this.ui.setCursorPosition({ x: 0, y: 0 })

        this.clearFixtures()

        ImportService.clearCache()
        SkillStoreImpl.clearCurrentSkill()
        EventStore.clearCache()
        CommandServiceImpl.clearFakedResponses()
        MercuryClientFactory.reset()
        MercuryClientFactory.setIsTestMode(false)

        this.commandFaker = new CommandFaker()
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

        if (
            diskUtil.doesDirExist(this.homeDir) &&
            testUtil.shouldClearCache()
        ) {
            diskUtil.deleteDir(this.homeDir)
        }

        if (testUtil.shouldCleanupAfterEach()) {
            FeatureFixture.deleteOldSkillDirs()
        }
    }

    protected static async afterAll() {
        await super.afterAll()
        if (testUtil.shouldCleanupAfterAll()) {
            FeatureFixture.deleteOldSkillDirs()
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
        this._emitter = undefined
        this.mercuryFixture = undefined
        this.organizationFixture = undefined
        this.personFixture = undefined
        this.skillFixture = undefined
        this.viewFixture = undefined
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

    protected static get emitter() {
        if (!this._emitter) {
            this._emitter = CliGlobalEmitter.Emitter()
        }
        return this._emitter
    }

    protected static set emitter(emitter: GlobalEmitter) {
        this._emitter = emitter
    }

    protected static resolveTestPath(...pathAfterTestDirsAndFiles: string[]) {
        return pathUtil.join(
            this.cliRoot,
            '__tests__',
            'testDirsAndFiles',
            ...pathAfterTestDirsAndFiles
        )
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
        return new FeatureFixture({
            cwd: this.cwd,
            serviceFactory: this.ServiceFactory(),
            ui: this.ui,
            apiClientFactory: this.getMercuryFixture().getApiClientFactory(),
            featureInstaller: this.featureInstaller,
            emitter: this.emitter,
            ...options,
        })
    }

    protected static getMercuryFixture() {
        if (!this.mercuryFixture) {
            this.mercuryFixture = new MercuryFixture(
                this.cwd,
                this.ServiceFactory()
            )
        }

        return this.mercuryFixture
    }

    protected static get people() {
        if (!this.personFixture) {
            this.personFixture = new PersonFixture(
                this.getMercuryFixture().getApiClientFactory()
            )
        }

        return this.personFixture
    }

    protected static getViewFixture() {
        if (!this.viewFixture) {
            const viewWriter = this.writers.Writer('view', {
                fileDescriptions: [],
            })
            this.viewFixture = new ViewFixture(
                this.cwd,
                viewWriter,
                this.Action('view', 'sync')
            )
        }

        return this.viewFixture
    }

    protected static get writers() {
        if (!this._writers) {
            this._writers = this.WriterFactory()
        }

        return this._writers
    }

    private static WriterFactory() {
        return new WriterFactory({
            templates,
            ui: this.ui,
            settings: this.Service('settings'),
        })
    }

    protected static async skipInstallSkillPrompts<
        E extends () => Promise<FeatureActionResponse>,
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

    protected static getOrganizationFixture() {
        if (!this.organizationFixture) {
            this.organizationFixture = new OrganizationFixture(
                this.people,
                this.StoreFactory()
            )
        }

        return this.organizationFixture
    }

    protected static getSkillFixture() {
        if (!this.skillFixture) {
            this.skillFixture = new SkillFixture(
                this.people,
                this.StoreFactory(),
                this.getMercuryFixture().getApiClientFactory()
            )
        }

        return this.skillFixture
    }

    protected static resolveHashSprucePath(...filePath: string[]) {
        return diskUtil.resolveHashSprucePath(this.cwd, ...filePath)
    }

    protected static get featureInstaller() {
        if (!this._featureInstaller) {
            const installer = this.FeatureInstaller()
            this._featureInstaller = installer
        }

        return this._featureInstaller
    }

    protected static set featureInstaller(installer: FeatureInstaller) {
        this._featureInstaller = installer
    }

    protected static FeatureInstaller(options?: Partial<FeatureOptions>) {
        const serviceFactory = this.ServiceFactory()
        const storeFactory = this.StoreFactory(options)
        const emitter = options?.emitter ?? this.emitter
        const apiClientFactory = this.getMercuryFixture().getApiClientFactory()

        const actionExecuter = this.ActionExecuter()

        const installer = FeatureInstallerFactory.WithAllFeatures({
            cwd: this.cwd,
            serviceFactory,
            storeFactory,
            ui: this.ui,
            emitter,
            apiClientFactory,
            actionExecuter,
            ...options,
        })
        return installer
    }

    protected static StoreFactory(options?: Partial<StoreFactoryOptions>) {
        const serviceFactory = this.ServiceFactory()

        return new StoreFactory({
            cwd: this.cwd,
            serviceFactory,
            homeDir: this.homeDir,
            apiClientFactory: this.getMercuryFixture().getApiClientFactory(),
            emitter: this.emitter,
            ...options,
        })
    }

    protected static Store<C extends StoreCode>(
        code: C,
        options?: CreateStoreOptions<C>
    ): StoreMap[C] {
        return this.StoreFactory().Store(code, {
            cwd: this.cwd,
            ...(options as any),
        })
    }

    protected static async waitForInput() {
        return this.ui.waitForInput()
    }

    protected static async assertIsFeatureInstalled(code: FeatureCode) {
        const isInstalled = await this.featureInstaller.isInstalled(code)
        assert.isTrue(isInstalled)
    }

    protected static async assertValidActionResponseFiles(
        results: FeatureActionResponse
    ) {
        for (const file of results.files ?? []) {
            await this.assertFilePassesTypeChecks(file.path)
        }

        // await Promise.all(
        // 	(results.files ?? []).map((file) => {
        // 		const checker = this.Service('typeChecker')
        // 		return checker.check(file.path)
        // 	})
        // )
    }

    protected static async assertFilePassesTypeChecks(file: string) {
        const checker = this.Service('typeChecker')
        await checker.check(file)
    }

    protected static async connectToApi(options?: ApiClientFactoryOptions) {
        return this.getMercuryFixture().connectToApi(options)
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

    protected static async openInFinder(options?: {
        file?: string
        dir?: string
        timeout?: number
    }) {
        await this.Service('command').execute(
            `open ${options?.file ?? options?.dir ?? this.cwd}`
        )
        await this.wait(options?.timeout ?? 99999999)
    }

    protected static log(...args: any[]) {
        testUtil.log(...args)
    }

    protected static Action<
        Action extends AbstractAction = AbstractAction,
        F extends FeatureCode = FeatureCode,
    >(featureCode: F, actionCode: string, options?: ExecuterOptions): Action {
        const executer = this.ActionExecuter({
            shouldThrowOnListenerError: true,
            ...options,
        }).Action(featureCode, actionCode)

        return executer as any
    }

    protected static ActionExecuter(options?: ExecuterOptions) {
        const serviceFactory = this.ServiceFactory()

        const actionFactory = new ActionFactory({
            writerFactory: this.writers,
            ui: this.ui,
            emitter: this.emitter,
            apiClientFactory: this.getMercuryFixture().getApiClientFactory(),
            cwd: this.cwd,
            serviceFactory,
            storeFactory: this.StoreFactory(),
            templates,
            optionOverrides: {
                'sync.schemas': {
                    shouldInstallMissingDependencies: true,
                },
                ...options?.optionOverrides,
            },
        })

        const executer = new ActionExecuter({
            ui: this.ui,
            emitter: this.emitter,
            actionFactory,
            featureInstallerFactory: () => {
                return this.featureInstaller
            },
            shouldAutoHandleDependencies: false,
            ...options,
        })

        return executer
    }

    protected static selectOptionBasedOnLabel(label: string) {
        const last = this.ui.getLastInvocation()
        assert.doesInclude(last.options.options.choices, {
            label,
        })

        const match = last.options.options.choices.find(
            (o: any) => o.label === label
        )

        void this.ui.sendInput(`${match.value}`)
    }
}

type ExecuterOptions = Partial<ActionExecuterOptions> & {
    optionOverrides?: OptionOverrides
}
