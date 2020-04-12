import AbstractUtility from './AbstractUtility'
import fs from 'fs-extra'
import pathUtil from 'path'
import { exec } from 'child_process'
import { set } from 'lodash'

export interface IAddOptions {
	dev?: boolean
}

export default class PackageUtility extends AbstractUtility {
	public set(
		path: string,
		value: string | Record<string, any>,
		dir = this.cwd
	) {
		const contents = this.readPackage(dir)
		const updated = set(contents, path, value)
		const destination = pathUtil.join(dir, 'package.json')

		fs.outputFileSync(destination, JSON.stringify(updated, null, 2))
	}

	/** Read a package.json */
	public readPackage(dir?: string): Record<string, any | undefined> {
		const source = dir ?? this.cwd
		const packagePath = pathUtil.join(source, 'package.json')
		const contents = fs.readFileSync(packagePath).toString()
		const parsed = JSON.parse(contents)
		return parsed
	}

	/** Check if a package is installed */
	public isInstalled(pkg: string, dir?: string) {
		const contents = this.readPackage(dir)
		return !!contents.dependencies?.[pkg] || !!contents.devDependencies?.[pkg]
	}

	/** Install a package */
	public async install(pkg: string[] | string, options?: IAddOptions) {
		const packages = Array.isArray(pkg) ? pkg : [pkg]
		let install = false
		for (const thisPackage of packages) {
			if (!this.isInstalled(thisPackage)) {
				install = true
				break
			}
		}
		if (install) {
			return new Promise((resolve, reject) => {
				exec(
					`yarn add ${packages.join(' ')}${options?.dev ? ' --dev' : ''}`,
					err => {
						if (err) {
							reject(err)
						}
						resolve()
					}
				)
			})
		}
	}

	/** Lint everything */
	public async lintFix() {
		// Await this.install(['eslint', 'eslint-config-spruce'], { dev: true })
		return new Promise(resolve => {
			exec(`yarn lint:fix`, err => {
				if (err) {
					this.log.warn('Linting skill failed! Moving on...')
					this.log.debug(err)
				}
				resolve()
			})
		})
	}

	/** Set all the things needed for testing */
	public async setupForTesting() {
		await this.install(['@sprucelabs/test', 'ava', 'ts-node'], {
			dev: true
		})

		// Update package.json appropriately
		this.set('scripts.test', 'ava **/*.test.ts')
		this.set('scripts.test:watch', 'ava  **/*.test.ts --watch')
		this.set('ava', {
			extensions: ['ts'],
			require: ['ts-node/register']
		})
	}
}
