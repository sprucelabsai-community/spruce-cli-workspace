import { SchemaValues } from '@sprucelabs/schema'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import upgradeSkillActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/upgradeSkillOptions.schema'
import InFlightEntertainment from '../../../InFlightEntertainment'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import SkillFeature from '../SkillFeature'

type OptionsSchema =
	SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptionsSchema
type Options = SchemaValues<OptionsSchema>

export default class UpgradeAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Upgrading your skill... 💪'
	public optionsSchema = upgradeSkillActionSchema
	public commandAliases = ['upgrade', 'update']

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const normalizedOptions = this.validateAndNormalizeOptions(options)
		const generatedFiles = await this.copyFiles(normalizedOptions)

		await this.updateScripts({
			shouldConfirm: normalizedOptions.upgradeMode !== 'forceEverything',
		})

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

		InFlightEntertainment.stop()

		results = actionUtil.mergeActionResults(results, dependencyResults, {
			headline: 'Upgrade',
			files: generatedFiles,
		})

		return results
	}

	private async reInstallPackageDependencies() {
		return this.Action('node', 'updateDependencies').execute({})
	}

	private async updateScripts(options: { shouldConfirm: boolean }) {
		const skillFeature = this.parent as SkillFeature
		await skillFeature.installScripts(this.cwd, {
			shouldConfirmIfScriptExistsButIsDifferent: options.shouldConfirm,
		})
	}

	private async copyFiles(normalizedOptions: Options) {
		const skillWriter = this.Writer('skill', {
			upgradeMode: normalizedOptions.upgradeMode,
		})
		const pkgService = this.Service('pkg')
		const name = pkgService.get('name')
		const description = pkgService.get('description')

		const generatedFiles = await skillWriter.writeSkill(this.cwd, {
			name,
			description,
		})
		return generatedFiles
	}
}
