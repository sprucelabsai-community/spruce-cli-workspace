import { SchemaValues } from '@sprucelabs/schema'
import { HASH_SPRUCE_DIR, diskUtil } from '@sprucelabs/spruce-skill-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import upgradeSkillActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/upgradeSkillOptions.schema'
import InFlightEntertainment from '../../../InFlightEntertainment'
import ScriptUpdaterImpl from '../../../updaters/ScriptUpdater'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class UpgradeAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Upgrading your skill... 💪'
	public optionsSchema = upgradeSkillActionSchema
	public commandAliases = ['upgrade', 'update']

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { upgradeMode } = this.validateAndNormalizeOptions(options)

		await this.updateScripts({
			shouldConfirm: upgradeMode !== 'forceEverything',
		})

		try {
			const files = await this.Writer('node', {
				upgradeMode,
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

			await this.Service('command').execute('yarn fix.lint')

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
		const features = await this.features.getInstalledFeatures()

		const doesHashSpruceExist = diskUtil.doesDirExist(
			diskUtil.resolvePath(this.cwd, HASH_SPRUCE_DIR)
		)

		if (!doesHashSpruceExist) {
			return
		}

		let scripts: Record<string, any> = {}

		for (const feature of features) {
			scripts = {
				...scripts,
				...feature.scripts,
			}
		}

		const scriptUpdater = ScriptUpdaterImpl.FromFeature(this.parent, {
			latestScripts: scripts,
		})

		await scriptUpdater.update({
			shouldConfirmIfScriptExistsButIsDifferent: options.shouldConfirm,
		})
	}
}

type OptionsSchema =
	SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptionsSchema
type Options = SchemaValues<OptionsSchema>
