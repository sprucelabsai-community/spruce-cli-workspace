import { SchemaValues } from '@sprucelabs/schema'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import upgradeSkillActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/upgradeSkillOptions.schema'
import InFlightEntertainment from '../../../InFlightEntertainment'
import ScriptUpdater from '../../../updaters/ScriptUpdater'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

type OptionsSchema =
	SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptionsSchema
type Options = SchemaValues<OptionsSchema>

export default class UpgradeAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Upgrading your skill... 💪'
	public optionsSchema = upgradeSkillActionSchema
	public commandAliases = ['upgrade', 'update']

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const normalizedOptions = this.validateAndNormalizeOptions(options)

		await this.updateScripts({
			shouldConfirm: normalizedOptions.upgradeMode !== 'forceEverything',
		})

		try {
			InFlightEntertainment.start([
				"Let's start the upgrade!",
				'While things are going, see if you can beat 1k points!',
				'Go!!!!',
			])

			const dependencyResults = await this.reInstallPackageDependencies()

			await this.Service('command').execute('yarn clean.build')
			await this.Service('command').execute('yarn build.dev')

			let results = {
				summaryLines: ['Build folder cleared.', 'Build complete.'],
			}

			results = actionUtil.mergeActionResults(results, dependencyResults, {
				headline: 'Upgrade',
			})

			return results
		} finally {
			InFlightEntertainment.stop()

			this.ui.renderHero('Finishing upgrade')
		}
	}

	private async reInstallPackageDependencies() {
		return this.Action('node', 'updateDependencies').execute({})
	}

	private async updateScripts(options: { shouldConfirm: boolean }) {
		const features = await this.featureInstaller.getInstalledFeatures()

		let scripts: Record<string, any> = {}

		for (const feature of features) {
			scripts = {
				...scripts,
				...feature.scripts,
			}
		}

		const scriptUpdater = ScriptUpdater.FromFeature(this.parent, {
			latestScripts: scripts,
		})

		await scriptUpdater.update({
			shouldConfirmIfScriptExistsButIsDifferent: options.shouldConfirm,
		})
	}
}
