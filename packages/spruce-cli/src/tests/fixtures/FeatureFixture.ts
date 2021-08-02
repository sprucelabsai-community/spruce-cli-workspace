import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import Cli, { CliBootOptions, CliInterface } from '../../cli'
import FeatureInstaller from '../../features/FeatureInstaller'
import { InstallFeature } from '../../features/features.types'
import { GlobalEmitter } from '../../GlobalEmitter'
import ServiceFactory, {
	ServiceProvider,
	Service,
	ServiceMap,
} from '../../services/ServiceFactory'
import { ApiClientFactory } from '../../types/apiClient.types'
import { GraphicsInterface } from '../../types/cli.types'
import testUtil from '../utilities/test.utility'

export interface CachedCli {
	cli: CliInterface
	cwd: string
}

export interface FeatureFixtureOptions {
	cwd: string
	serviceFactory: ServiceFactory
	ui: GraphicsInterface
	shouldGenerateCacheIfMissing?: boolean
	apiClientFactory: ApiClientFactory
	emitter?: GlobalEmitter
	featureInstaller?: FeatureInstaller
}

export default class FeatureFixture implements ServiceProvider {
	private cwd: string
	private installedSkills: Record<string, CachedCli> = {}
	private serviceFactory: ServiceFactory
	private static linkedUtils = false
	private static dirsToDelete: string[] = []
	private term: GraphicsInterface
	private generateCacheIfMissing = false
	private apiClientFactory: ApiClientFactory
	private emitter?: GlobalEmitter
	private featureInstaller?: FeatureInstaller

	public constructor(options: FeatureFixtureOptions) {
		if (options.cwd.search('packages/spruce-cli') > -1) {
			throw new Error("You can't run FeatureFixture in the cli directory.")
		}

		this.cwd = options.cwd
		this.serviceFactory = options.serviceFactory
		this.term = options.ui
		this.generateCacheIfMissing = !!options.shouldGenerateCacheIfMissing
		this.apiClientFactory = options.apiClientFactory
		this.emitter = options.emitter
		this.featureInstaller = options.featureInstaller
	}

	public static deleteOldSkillDirs() {
		for (const dir of this.dirsToDelete) {
			diskUtil.deleteDir(dir)
		}
	}

	public Service<S extends Service>(
		type: S,
		cwd?: string | undefined
	): ServiceMap[S] {
		return this.serviceFactory.Service(cwd ?? this.cwd, type)
	}

	public async Cli(options?: CliBootOptions) {
		await this.linkWorkspacePackages()

		const cli = await Cli.Boot({
			cwd: this.cwd,
			graphicsInterface: this.term,
			apiClientFactory: this.apiClientFactory,
			emitter: this.emitter,
			featureInstaller: this.featureInstaller,
			...(options ?? {}),
		})

		return cli
	}

	private async linkWorkspacePackages() {
		if (!FeatureFixture.linkedUtils) {
			FeatureFixture.linkedUtils = true

			// const expectedLinkedDir = pathUtil.join(
			// 	os.homedir(),
			// 	'.config',
			// 	'yarn',
			// 	'link',
			// 	'@sprucelabs',
			// 	'spruce-skill-utils'
			// )

			// if (!fsUtil.existsSync(expectedLinkedDir)) {
			// 	const command = this.Service('command')
			// 	try {
			// 		await command.execute(
			// 			`cd ${pathUtil.join(
			// 				__dirname,
			// 				'..',
			// 				'..',
			// 				'..',
			// 				'spruce-skill-utils'
			// 			)} && yarn link`
			// 		)
			// 	} catch (err) {
			// 		if (fsUtil.existsSync(expectedLinkedDir)) {
			// 			log.warn(`Symlink ${expectedLinkedDir} already exists`)
			// 		} else {
			// 			log.warn(
			// 				`Symlink ${expectedLinkedDir} failed, but the check thinks it is missing`
			// 			)
			// 		}
			// 	}
			// }
		}
	}

	public async installCachedFeatures(
		cacheKey: string,
		bootOptions?: CliBootOptions
	) {
		return this.installFeatures([], cacheKey, bootOptions)
	}

	public async installFeatures(
		features: InstallFeature[],
		cacheKey?: string,
		bootOptions?: CliBootOptions
	) {
		if (this.isCached(cacheKey)) {
			return this.installedSkills[cacheKey as string].cli
		}

		let isCached = false
		if (cacheKey && testUtil.isCacheEnabled()) {
			isCached = this.doesCacheExist(cacheKey)

			if (!isCached && !this.generateCacheIfMissing) {
				throw new Error(
					`Cached skill not found, make sure\n\n"${cacheKey}"\n\nis in your package.json under "testSkillCache" and run\n\n\`yarn cache.tests\``
				)
			}

			if (isCached) {
				await this.copyCachedSkillToCwd(cacheKey)
			} else {
				this.removeCwdFromCacheTracker(cacheKey)
			}
		}

		const cli = await this.Cli(bootOptions)

		if (!isCached) {
			await cli.installFeatures({
				features,
			})
		}

		if (cacheKey && testUtil.isCacheEnabled()) {
			!isCached && this.addCwdToCacheTracker(cacheKey)
			this.cacheCli(cacheKey, cli)
		}

		await this.linkLocalPackages()

		return cli
	}

	private isCached(cacheKey: string | undefined) {
		return (
			cacheKey && this.installedSkills[cacheKey] && testUtil.isCacheEnabled()
		)
	}

	public async linkLocalPackages() {
		// const command = this.Service('command')
		// await command.execute(`yarn link @sprucelabs/spruce-skill-utils`)
	}

	private async copyCachedSkillToCwd(cacheKey: string) {
		let isCached = this.doesCacheExist(cacheKey)

		if (isCached) {
			let settings = this.loadCacheTracker()
			await diskUtil.copyDir(settings[cacheKey], this.cwd)

			if (process.env.TEST_HOST) {
				this.Service('env').set('HOST', process.env.TEST_HOST)
			}

			FeatureFixture.dirsToDelete.push(this.cwd)
		}
	}

	private addCwdToCacheTracker(cacheKey: string) {
		let settings = this.loadCacheTracker()

		if (!settings) {
			settings = {}
		}

		if (!settings[cacheKey]) {
			settings[cacheKey] = this.cwd
			this.writeCacheSettings(settings)
		}
		return settings
	}

	private removeCwdFromCacheTracker(cacheKey: string) {
		let settings = this.loadCacheTracker()

		if (!settings) {
			settings = {}
		}

		if (settings[cacheKey]) {
			delete settings[cacheKey]
			this.writeCacheSettings(settings)
		}
	}

	private writeCacheSettings(settings: Record<string, any>) {
		const settingsFile = this.getTestCacheTrackerFilePath()
		const settingsFolder = pathUtil.dirname(settingsFile)

		!diskUtil.doesDirExist(settingsFolder) && diskUtil.createDir(settingsFolder)

		diskUtil.writeFile(settingsFile, JSON.stringify(settings, null, 2))
	}

	private doesCacheExist(cacheKey: string) {
		let alreadyInstalled = false

		const settings = this.loadCacheTracker()

		if (settings?.[cacheKey]) {
			alreadyInstalled = true
		}

		if (alreadyInstalled) {
			alreadyInstalled = diskUtil.doesDirExist(
				diskUtil.resolvePath(settings[cacheKey], 'node_modules')
			)
		}

		return alreadyInstalled
	}

	public loadCacheTracker() {
		const settingsFile = this.getTestCacheTrackerFilePath()

		const exists = diskUtil.doesFileExist(settingsFile)
		let settingsObject: Record<string, any> = {}

		try {
			settingsObject = exists ? JSON.parse(diskUtil.readFile(settingsFile)) : {}
			// eslint-disable-next-line no-empty
		} catch {}

		return settingsObject
	}

	public getTestCacheTrackerFilePath() {
		return diskUtil.resolveHashSprucePath(
			__dirname,
			'tmp',
			`cached-skills.json`
		)
	}

	private cacheCli(cacheKey: string, cli: CliInterface) {
		this.installedSkills[cacheKey] = {
			cwd: this.cwd,
			cli,
		}
	}
}
