import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import fs from 'fs-extra'
import { set, get } from 'lodash'
import SpruceError from '../errors/SpruceError'
import { NpmPackage } from '../types/cli.types'
import isCi from '../utilities/isCi'
import CommandService from './CommandService'

export interface AddOptions {
	isDev?: boolean
	shouldForceInstall?: boolean
	shouldCleanupLockFiles?: boolean
}

export default class PkgService extends CommandService {
	private _parsedPkg?: Record<string, any>

	public get(path: string | string[]) {
		const contents = this.readPackage()
		return get(contents, path)
	}

	public set(options: {
		path: string | string[]
		value: string | Record<string, any> | undefined
	}) {
		const { path, value } = options
		const contents = this.readPackage()
		const updated = set(contents, path, value)
		const destination = this.buildPath()

		fs.outputFileSync(destination, JSON.stringify(updated, null, 2))
		this._parsedPkg = undefined
	}

	public doesExist() {
		return diskUtil.doesFileExist(this.buildPath())
	}

	public unset(path: string | string[]) {
		this.set({ path, value: undefined })
	}

	public readPackage(): Record<string, any | undefined> {
		if (this._parsedPkg) {
			return this._parsedPkg
		}
		const packagePath = this.buildPath()

		try {
			const contents = fs.readFileSync(packagePath).toString()
			const parsed = JSON.parse(contents)
			this._parsedPkg = parsed

			return parsed
		} catch (err: any) {
			throw new SpruceError({
				code: 'FAILED_TO_IMPORT',
				file: packagePath,
				originalError: err,
			})
		}
	}

	private buildPath() {
		return pathUtil.join(this.cwd, 'package.json')
	}

	public isInstalled(pkg: string) {
		try {
			const contents = this.readPackage()

			return !!contents.dependencies?.[pkg] || !!contents.devDependencies?.[pkg]
		} catch (e) {
			return false
		}
	}

	public async install(pkg?: string[] | string, options?: AddOptions) {
		const shouldCleanupLockFiles = options?.shouldCleanupLockFiles !== false
		const deleteLockFile = shouldCleanupLockFiles
			? this.deleteLockFile.bind(this)
			: () => {}

		if (!pkg) {
			await this.execute('yarn', { args: ['install'] })
			deleteLockFile()
			return { totalInstalled: -1, totalSkipped: -1 }
		}

		deleteLockFile()

		const packages = Array.isArray(pkg) ? pkg : [pkg]
		const toInstall = []
		const labsModules: string[] = []

		let totalInstalled = 0
		let totalSkipped = 0

		for (const thisPackage of packages) {
			const isInstalled =
				!options?.shouldForceInstall && this.isInstalled(thisPackage)
			if (thisPackage.startsWith('@sprucelabs/') || !isInstalled) {
				toInstall.push(this.stripLatest(thisPackage))
				totalInstalled++
			} else {
				totalSkipped++
			}
		}

		if (totalInstalled > 0) {
			const { executable, args } = PkgService.buildCommandAndArgs(
				toInstall,
				options
			)

			await this.execute(executable, {
				args,
			})
		} else if (
			!diskUtil.doesDirExist(pathUtil.join(this.cwd, 'node_modules'))
		) {
			await this.execute('yarn', { args: ['install'] })
		}

		deleteLockFile()

		this._parsedPkg = undefined

		return { totalInstalled: totalInstalled + labsModules.length, totalSkipped }
	}

	public static buildCommandAndArgs(
		toInstall: string[],
		options: AddOptions | undefined
	) {
		const args: any[] = [
			isCi() && '--cache-folder',
			isCi() && diskUtil.createRandomTempDir(),
			'add',
			...toInstall,
		].filter((a) => !!a)

		if (options?.isDev) {
			args.push('-D')
		}

		const executable = 'yarn'
		return { executable, args }
	}

	public deleteLockFile() {
		const files = ['package-lock.json', 'yarn.lock']
		for (const file of files) {
			const lock = pathUtil.join(this.cwd, file)
			if (diskUtil.doesFileExist(lock)) {
				diskUtil.deleteFile(lock)
			}
		}
	}

	public async uninstall(pkg: string[] | string) {
		const packages = Array.isArray(pkg) ? pkg : [pkg]
		const args: string[] = ['uninstall', ...packages]
		await this.execute('npm', {
			args,
		})

		this._parsedPkg = undefined

		await this.install()
	}

	public stripLatest(name: string): string {
		return name.replace('@latest', '')
	}

	public buildPackageName(dep: NpmPackage): string {
		const { name, version } = dep
		if (!version) {
			return name
		}

		return `${name}@${version}`
	}
}
