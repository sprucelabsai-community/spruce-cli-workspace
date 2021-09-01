import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { uniqBy } from 'lodash'
import InFlightEntertainment from '../../../InFlightEntertainment'
import PkgService from '../../../services/PkgService'
import { NpmPackage } from '../../../types/cli.types'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'updateDependenciesAction',
	description:
		'Clear lock files and node_modules and then reinstalls all modules.',
	fields: {},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>
export default class UpdateDependenciesAction extends AbstractAction<OptionsSchema> {
	public code = 'updateDependencies'
	public optionsSchema = optionsSchema
	public commandAliases = ['update.dependencies']
	public invocationMessage = 'Updating dependencies... 💪'

	public async execute(_options: Options): Promise<FeatureActionResponse> {
		const files = ['package-lock.json', 'yarn.lock', 'node_modules']

		for (const file of files) {
			diskUtil.deleteFile(diskUtil.resolvePath(this.cwd, file))
		}

		InFlightEntertainment.start(['Here we go!', 'Good luck!'])

		const { totalDependencies, totalDevDependencies } =
			await this.installDependencies()

		InFlightEntertainment.stop()

		return {
			headline: 'Update Complete!',
			summaryLines: [
				`${totalDependencies} dependencie${
					totalDependencies === 1 ? '' : 's'
				} updated! 💪`,
				`${totalDevDependencies} dev dependencie${
					totalDevDependencies === 1 ? '' : 's'
				} updated! 💪`,
			],
		}
	}

	private async installDependencies() {
		const features = await this.featureInstaller.getInstalledFeatures()

		const pkg = this.Service('pkg')
		const pkgContents = pkg.readPackage()

		let dependencies: { stripped: string; name: string }[] =
			Object.keys(pkgContents.dependencies ?? {}).map((d) => ({
				stripped: d,
				name: d,
			})) ?? []

		let devDependencies: { stripped: string; name: string }[] =
			Object.keys(pkgContents.devDependencies ?? {}).map((d) => ({
				stripped: d,
				name: d,
			})) ?? []

		for (const feature of features) {
			for (const dep of feature.packageDependencies as NpmPackage[]) {
				if (dep.isDev) {
					devDependencies.push({
						stripped: pkg.stripLatest(dep.name),
						name: pkg.buildPackageName(dep),
					})
				} else {
					dependencies.push({
						stripped: pkg.stripLatest(dep.name),
						name: pkg.buildPackageName(dep),
					})
				}
			}
		}

		dependencies = uniqBy(dependencies, 'stripped').filter(
			(d) => !this.isBlockedFromUpgrade(d.stripped, pkg)
		)
		devDependencies = uniqBy(devDependencies, 'stripped').filter(
			(d) => !this.isBlockedFromUpgrade(d.stripped, pkg)
		)

		if (dependencies.length > 0) {
			InFlightEntertainment.writeStatus(
				`Installing ${dependencies.length} dependenc${
					dependencies.length === 1 ? 'y' : 'ies'
				} with npm.`
			)
			await pkg.install(
				dependencies.map((d) => d.name),
				{
					shouldForceInstall: true,
				}
			)
		}

		if (devDependencies.length > 0) {
			InFlightEntertainment.writeStatus(
				`Installing ${devDependencies.length} dev dependenc${
					dependencies.length === 1 ? 'y' : 'ies'
				} with npm.`
			)
			await pkg.install(
				devDependencies.map((d) => d.name),
				{
					shouldForceInstall: true,
					isDev: true,
				}
			)
		}

		InFlightEntertainment.writeStatus(
			`Re-running yarn to catch any missed modules...`
		)

		//required to get install over the line for some reason????????
		await pkg.install()

		return {
			totalDependencies: dependencies.length,
			totalDevDependencies: devDependencies.length,
		}
	}

	public blockUpgrade(name: string, pkg: PkgService) {
		const content = pkg.get('skill.upgradeIgnoreList') ?? []
		content.push(name)
		pkg.set({ path: 'skill.upgradeIgnoreList', value: content })
	}

	public isBlockedFromUpgrade(name: string, pkg: PkgService) {
		const content = pkg.get('skill.upgradeIgnoreList') ?? []
		const isBlocked = content.indexOf(name) > -1
		return isBlocked
	}
}
