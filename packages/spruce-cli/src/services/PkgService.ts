import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import fs from 'fs-extra'
import { set, get } from 'lodash'
import SpruceError from '../errors/SpruceError'
import CommandService from './CommandService'

export interface AddOptions {
	isDev?: boolean
}

export default class PkgService extends CommandService {
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
	}

	public doesExist() {
		return diskUtil.doesFileExist(this.buildPath())
	}

	public unset(path: string | string[]) {
		this.set({ path, value: undefined })
	}

	public readPackage(): Record<string, any | undefined> {
		const packagePath = this.buildPath()

		try {
			const contents = fs.readFileSync(packagePath).toString()
			const parsed = JSON.parse(contents)

			return parsed
		} catch (err) {
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

	public async install(pkg: string[] | string, options?: AddOptions) {
		const packages = Array.isArray(pkg) ? pkg : [pkg]
		const toInstall = []
		const labsModules: string[] = []
		let totalInstalled = 0
		let totalSkipped = 0

		for (const thisPackage of packages) {
			const isInstalled = this.isInstalled(thisPackage)
			if (thisPackage.startsWith('@sprucelabs/') || !isInstalled) {
				toInstall.push(thisPackage)
				totalInstalled++
			} else {
				totalSkipped++
			}
		}

		if (totalInstalled > 0) {
			const args: string[] = [
				'--cache-min 9999999',
				'--no-progress',
				'install',
				...toInstall,
			]

			if (options?.isDev) {
				args.push('-D')
			}

			await this.execute('npm', {
				args,
			})
		}

		if (!diskUtil.doesDirExist(pathUtil.join(this.cwd, 'node_modules'))) {
			await this.execute('yarn', { args: ['install'] })
		}

		this.deleteLockFile()

		return { totalInstalled: totalInstalled + labsModules.length, totalSkipped }
	}

	private deleteLockFile() {
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
	}
}
