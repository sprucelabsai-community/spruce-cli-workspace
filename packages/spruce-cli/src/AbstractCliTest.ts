import os from 'os'
import pathUtil from 'path'
import { Mercury } from '@sprucelabs/mercury'
import AbstractSpruceTest from '@sprucelabs/test'
import fs from 'fs-extra'
import * as uuid from 'uuid'
import { boot, ICliBootOptions } from './cli'
import ServiceFactory, {
	Service,
	IServiceMap,
} from './factories/ServiceFactory'
import FeatureInstallerFactory from './features/FeatureInstallerFactory'
import TestInterface from './interfaces/TestInterface'
import StoreFactory, { StoreCode, IStoreMap } from './stores/StoreFactory'
import { IGraphicsInterface } from './types/cli.types'
import diskUtil from './utilities/disk.utility'

export default abstract class AbstractCliTest extends AbstractSpruceTest {
	protected static cliRoot = pathUtil.join(__dirname)

	protected static freshCwd() {
		const tmpDirectory = pathUtil.join(os.tmpdir(), 'tmp', uuid.v4())
		fs.ensureDirSync(tmpDirectory)

		return tmpDirectory
	}

	protected static resolveTestPath(...pathAfterTestDirsAndFiles: string[]) {
		return pathUtil.join(
			this.cliRoot,
			'__tests__',
			'testDirsAndFiles',
			...pathAfterTestDirsAndFiles
		)
	}

	protected static async beforeEach() {
		super.beforeEach()

		this.cwd = this.freshCwd()
	}

	protected static async Cli(options?: ICliBootOptions) {
		const cli = await boot({
			cwd: this.cwd,
			...(options ?? {}),
		})

		return cli
	}

	protected static Service<S extends Service>(
		type: S,
		cwd?: string
	): IServiceMap[S] {
		const sf = this.ServiceFactory()
		return sf.Service(cwd ?? this.cwd, type)
	}

	protected static ServiceFactory() {
		return new ServiceFactory(new Mercury())
	}

	protected static Term(): IGraphicsInterface {
		return new TestInterface()
	}

	protected static resolveHashSprucePath(...filePath: string[]) {
		return diskUtil.resolveHashSprucePath(this.cwd, ...filePath)
	}

	protected static FeatureInstaller() {
		const serviceFactory = this.ServiceFactory()
		const storeFactory = this.StoreFactory()

		return FeatureInstallerFactory.WithAllFeatures({
			cwd: this.cwd,
			serviceFactory,
			storeFactory,
			term: this.Term(),
		})
	}

	protected static StoreFactory() {
		const mercury = new Mercury()
		const serviceFactory = new ServiceFactory(mercury)
		return new StoreFactory(this.cwd, mercury, serviceFactory)
	}

	protected static Store<C extends StoreCode>(
		code: C,
		cwd?: string
	): IStoreMap[C] {
		return this.StoreFactory().Store(code, this.cwd ?? cwd)
	}
}
