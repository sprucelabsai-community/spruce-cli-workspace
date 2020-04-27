import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import log from '../lib/log'
import AbstractFeature, { IFeaturePackage } from './AbstractFeature'

export default class SkillFeature extends AbstractFeature {
	public featureDependencies = []

	public packages: IFeaturePackage[] = [
		{ name: '@sprucelabs/test', isDev: true },
		{ name: 'ts-node', isDev: true }
	]

	public async install(options?: Record<string, any>) {
		log.debug('Install!', { options })
	}

	public async isInstalled(
		/** The directory to check if a skill is installed. Default is the cwd. */
		dir?: string
	) {
		// Check if the .spruce directory exists
		const homedir = os.homedir()
		const homeSpruceDir = path.join(homedir, '.spruce')
		const spruceDir = path.join(`${dir ?? this.cwd}`, '.spruce')
		log.debug({ spruceDir, dir, cwd: this.cwd })
		if (homeSpruceDir !== spruceDir && fs.existsSync(spruceDir)) {
			return true
		}

		return false
	}
}
