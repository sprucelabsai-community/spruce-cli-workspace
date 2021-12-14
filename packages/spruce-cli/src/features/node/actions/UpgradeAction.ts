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
			const files = await this.Writer('node', {
				upgradeMode: normalizedOptions.upgradeMode,
			}).writeNodeModule(this.cwd, {
				shouldConfirmBeforeWriting: true,
				shouldWriteIndex: false,
			})

			this.ui.clear()
			InFlightEntertainment.start([
				"Let's start the upgrade!",
				'While things are going, see if you can beat 1k points!',
				'Go!!!!',
			])

			const dependencyResults = await this.reInstallPackageDependencies()

			return actionUtil.mergeActionResults(dependencyResults, {
				headline: 'Upgrade',
				files,
			})
		} finally {
			InFlightEntertainment.stop()
			this.ui.renderHero('Upgrade')
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
