import osUtil from 'os'
import {
	ConnectionOptions,
	MercuryClientFactory,
} from '@sprucelabs/mercury-client'
import { MercuryEventEmitter, SpruceSchemas } from '@sprucelabs/mercury-types'
import {
	diskUtil,
	HealthCheckResults,
	HEALTH_DIVIDER,
} from '@sprucelabs/spruce-skill-utils'
import { templates } from '@sprucelabs/spruce-templates'
import { Command, CommanderStatic } from 'commander'
import './addons/filePrompt.addon'
import { CLI_HERO, DEFAULT_HOST } from './constants'
import SpruceError from './errors/SpruceError'
import ActionExecuter from './features/ActionExecuter'
import ActionFactory from './features/ActionFactory'
import FeatureCommandAttacher, {
	BlockedCommands,
	OptionOverrides,
} from './features/FeatureCommandAttacher'
import FeatureInstaller from './features/FeatureInstaller'
import FeatureInstallerFactory from './features/FeatureInstallerFactory'
import { FeatureCode, InstallFeatureOptions } from './features/features.types'
import CliGlobalEmitter, {
	GlobalEmitter,
	GlobalEventContract,
} from './GlobalEmitter'
import InFlightEntertainment from './InFlightEntertainment'
import TerminalInterface from './interfaces/TerminalInterface'
import CommandService from './services/CommandService'
import ImportService from './services/ImportService'
import PkgService from './services/PkgService'
import ServiceFactory from './services/ServiceFactory'
import StoreFactory from './stores/StoreFactory'
import {
	ApiClient,
	ApiClientFactory,
	ApiClientFactoryOptions,
} from './types/apiClient.types'
import { GraphicsInterface } from './types/cli.types'
import apiClientUtil from './utilities/apiClient.utility'
import { argParserUtil } from './utilities/argParser.utility'
import WriterFactory from './writers/WriterFactory'

interface HealthOptions {
	shouldRunOnSourceFiles?: boolean
}

export interface CliInterface extends MercuryEventEmitter<GlobalEventContract> {
	installFeatures: FeatureInstaller['install']
	getFeature: FeatureInstaller['getFeature']
	checkHealth(options?: HealthOptions): Promise<HealthCheckResults>
}

export interface CliBootOptions {
	cwd?: string
	homeDir?: string
	program?: CommanderStatic['program']
	graphicsInterface?: GraphicsInterface
	emitter?: GlobalEmitter
	apiClientFactory?: ApiClientFactory
	featureInstaller?: FeatureInstaller
	host?: string
}

type PromiseCache = Record<string, Promise<ApiClient>>

export default class Cli implements CliInterface {
	private cwd: string
	private featureInstaller: FeatureInstaller
	private serviceFactory: ServiceFactory
	public readonly emitter: GlobalEmitter
	private static apiClients: PromiseCache = {}
	private attacher?: FeatureCommandAttacher
	private actionExecuter?: ActionExecuter

	private constructor(
		cwd: string,
		featureInstaller: FeatureInstaller,
		serviceFactory: ServiceFactory,
		emitter: GlobalEmitter,
		attacher?: FeatureCommandAttacher,
		actionExecuter?: ActionExecuter
	) {
		this.cwd = cwd
		this.featureInstaller = featureInstaller
		this.serviceFactory = serviceFactory
		this.emitter = emitter
		this.attacher = attacher
		this.actionExecuter = actionExecuter
	}

	public static async resetApiClients() {
		for (const key in this.apiClients) {
			await (await this.apiClients[key]).disconnect()
		}

		this.apiClients = {}
	}

	public getAttacher() {
		return this.attacher
	}

	public getActionExecuter() {
		return this.actionExecuter
	}

	public async on(...args: any[]) {
		//@ts-ignore
		return this.emitter.on(...args)
	}

	public async off(...args: any[]) {
		//@ts-ignore
		return this.emitter.off(...args)
	}

	public async emit(...args: any[]) {
		//@ts-ignore
		return this.emitter.emit(...args)
	}

	public async emitAndFlattenResponses(...args: any[]) {
		//@ts-ignore
		return this.emitter.emitAndFlattenResponses(...args)
	}

	public async installFeatures(options: InstallFeatureOptions) {
		return this.featureInstaller.install(options)
	}

	public getFeature<C extends FeatureCode>(code: C) {
		return this.featureInstaller.getFeature(code)
	}

	public async checkHealth(
		options?: HealthOptions
	): Promise<HealthCheckResults> {
		const isInstalled = await this.featureInstaller.isInstalled('skill')

		if (!isInstalled) {
			return {
				skill: {
					status: 'failed',
					errors: [
						new SpruceError({
							// @ts-ignore
							code: 'SKILL_NOT_INSTALLED',
						}),
					],
				},
			}
		}

		try {
			const commandService = this.serviceFactory.Service(this.cwd, 'command')
			const command =
				options?.shouldRunOnSourceFiles === false
					? 'yarn health'
					: 'yarn health.local'
			const results = await commandService.execute(command)
			const resultParts = results.stdout.split(HEALTH_DIVIDER)

			return JSON.parse(resultParts[1]) as HealthCheckResults
		} catch (originalError: any) {
			const error = new SpruceError({
				code: 'BOOT_ERROR',
				originalError,
			})

			return {
				skill: {
					status: 'failed',
					errors: [error],
				},
			}
		}
	}

	public static async Boot(options?: CliBootOptions): Promise<CliInterface> {
		const program = options?.program
		const emitter = options?.emitter ?? CliGlobalEmitter.Emitter()

		let cwd = options?.cwd ?? process.cwd()

		ImportService.enableCaching()

		const serviceFactory = new ServiceFactory()
		const apiClientFactory =
			options?.apiClientFactory ??
			Cli.buildApiClientFactory(cwd, serviceFactory, options)

		const storeFactory = new StoreFactory({
			cwd,
			serviceFactory,
			homeDir: options?.homeDir ?? osUtil.homedir(),
			emitter,
			apiClientFactory,
		})

		const ui = options?.graphicsInterface ?? new TerminalInterface(cwd)
		let featureInstaller: FeatureInstaller | undefined

		const writerFactory = new WriterFactory({
			templates,
			ui,
			settings: serviceFactory.Service(cwd, 'settings'),
			linter: serviceFactory.Service(cwd, 'lint'),
		})

		const optionOverrides = this.loadOptionOverrides(
			serviceFactory.Service(cwd, 'pkg')
		)

		const blockedCommands = this.loadCommandBlocks(
			serviceFactory.Service(cwd, 'pkg')
		)

		const actionFactory = new ActionFactory({
			ui,
			emitter,
			apiClientFactory,
			cwd,
			serviceFactory,
			storeFactory,
			templates,
			writerFactory,
			blockedCommands,
			optionOverrides,
		})

		const actionExecuter = new ActionExecuter({
			actionFactory,
			ui,
			emitter,
			//@ts-ignore
			featureInstallerFactory: () => featureInstaller,
		})

		featureInstaller =
			options?.featureInstaller ??
			FeatureInstallerFactory.WithAllFeatures({
				cwd,
				serviceFactory,
				storeFactory,
				ui,
				emitter,
				apiClientFactory,
				actionExecuter,
			})

		let attacher: FeatureCommandAttacher | undefined

		if (program) {
			attacher = new FeatureCommandAttacher({
				program,
				ui,
				actionExecuter,
			})

			const codes = FeatureInstallerFactory.featureCodes

			for (const code of codes) {
				const feature = featureInstaller.getFeature(code)
				await attacher.attachFeature(feature)
			}

			program.commands.sort((a: any, b: any) => a._name.localeCompare(b._name))

			program.action((_, command) => {
				throw new SpruceError({
					code: 'INVALID_COMMAND',
					args: command.args || [],
				})
			})
		}

		const cli = new Cli(
			cwd,
			featureInstaller,
			serviceFactory,
			emitter,
			attacher,
			actionExecuter
		)

		return cli as CliInterface
	}

	private static loadCommandBlocks(pkg: PkgService): BlockedCommands {
		let blocks: BlockedCommands = {}
		if (pkg.doesExist()) {
			blocks = pkg.get('skill.blockedCommands') ?? {}
		}
		return blocks
	}

	private static loadOptionOverrides(pkg: PkgService): OptionOverrides {
		const mapped: OptionOverrides = {}

		if (pkg.doesExist()) {
			const overrides = pkg.get('skill.commandOverrides')

			Object.keys(overrides ?? {}).forEach((command) => {
				const options = argParserUtil.parse(overrides[command])
				mapped[command] = options
			})
		}
		return mapped
	}

	public static buildApiClientFactory(
		cwd: string,
		serviceFactory: ServiceFactory,
		bootOptions?: CliBootOptions & ConnectionOptions
	): ApiClientFactory {
		const apiClientFactory = async (options?: ApiClientFactoryOptions) => {
			const key = apiClientUtil.generateClientCacheKey(options)

			if (!Cli.apiClients[key]) {
				Cli.apiClients[key] = Cli.connectToApi(
					cwd,
					serviceFactory,
					options,
					bootOptions
				)
			}

			return Cli.apiClients[key]
		}

		return apiClientFactory
	}

	private static async connectToApi(
		cwd: string,
		serviceFactory: ServiceFactory,
		options?: ApiClientFactoryOptions,
		bootOptions?: CliBootOptions & ConnectionOptions
	): Promise<ApiClient> {
		const connect = bootOptions?.apiClientFactory
			? bootOptions.apiClientFactory
			: async () => {
					const eventsContracts =
						require('#spruce/events/events.contract').default

					const client: ApiClient = await MercuryClientFactory.Client({
						contracts: eventsContracts as any,
						host: bootOptions?.host ?? DEFAULT_HOST,
						allowSelfSignedCrt: true,
						...bootOptions,
					})

					return client
			  }

		const {
			shouldAuthAsCurrentSkill = false,
			shouldAuthAsLoggedInPerson = true,
		} = options ?? {}

		const client = await connect()

		let auth: SpruceSchemas.Mercury.v2020_12_25.AuthenticateEmitPayload = {}

		const pkg = serviceFactory.Service(cwd, 'pkg')
		const doesPkgExist = pkg.doesExist()

		if (options?.skillId && options?.apiKey) {
			auth = {
				skillId: options.skillId,
				apiKey: options.apiKey,
			}
		} else if (shouldAuthAsCurrentSkill) {
			const skill = serviceFactory.Service(cwd, 'auth').getCurrentSkill()

			if (skill) {
				auth = {
					skillId: skill.id,
					apiKey: skill.apiKey,
				}
			}
		} else if (doesPkgExist && shouldAuthAsLoggedInPerson) {
			const person = serviceFactory.Service(cwd, 'auth').getLoggedInPerson()

			if (person) {
				auth.token = person.token
			}
		}

		if (Object.keys(auth).length > 0) {
			await client.authenticate({
				...(auth as any),
			})

			//@ts-ignore
			client.auth = auth
		}

		return client
	}
}

export async function run(argv: string[] = []): Promise<void> {
	const program = new Command()
	let cwd = process.cwd()

	program.storeOptionsAsProperties(false)
	program.option('--no-color', 'Disable color output in the console')
	program.option(
		'-d, --directory <path>',
		'The working directory to execute the command'
	)
	program.option('-v, --version', 'The version of the cli')

	const dirIdx = process.argv.findIndex(
		(v) => v === '--directory' || v === '-d'
	)

	if (dirIdx > -1) {
		const dir = process.argv[dirIdx + 1]
		const newCwd = diskUtil.resolvePath(cwd, dir)
		cwd = newCwd
	}

	const terminal = new TerminalInterface(
		cwd,
		process.env.CLI_RENDER_STACK_TRACES !== 'false'
	)
	terminal.clear()
	terminal.renderHero(CLI_HERO)

	const isAskingForVersion =
		process.argv.findIndex((v) => v === '--version' || v === '-v') > -1

	if (isAskingForVersion) {
		const json = require('../package.json')
		terminal.renderHeadline(`Version ${json.version}`)
		return
	}

	await Cli.Boot({
		program,
		cwd,
		host: process.env.HOST,
		graphicsInterface: terminal,
	})

	await setupInFlightEntertainment(terminal)

	const command = await program.parseAsync(argv)

	//@ts-ignore
	const results = await command._actionResults[0]

	for (const client of MercuryClientFactory.getClients()) {
		await client.disconnect()
	}

	return results
}

async function setupInFlightEntertainment(ui: TerminalInterface) {
	if (
		TerminalInterface.doesSupportColor() &&
		process.env.ENABLE_INSTALL_ENTERTAINMENT !== 'false'
	) {
		const command = new CommandService(diskUtil.resolvePath(__dirname, '../'))
		InFlightEntertainment.setup({ command, ui })

		FeatureInstaller.startInFlightIntertainmentHandler = (didUpdateHandler) => {
			InFlightEntertainment.start()
			didUpdateHandler((message) => {
				InFlightEntertainment.writeStatus(message)
			})
		}

		FeatureInstaller.stopInFlightIntertainmentHandler = () => {
			InFlightEntertainment.stop()
		}
	}
}
