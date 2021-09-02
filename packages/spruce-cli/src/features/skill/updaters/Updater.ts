import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import AbstractFeature from '../../AbstractFeature'

type UpgradeOptions = SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptions

type Feature =
	AbstractFeature<SpruceSchemas.SpruceCli.v2020_07_22.SkillFeatureSchema>

export default class Updater {
	private feature: Feature
	public constructor(skill: Feature) {
		this.feature = skill
	}

	public async updateFiles(normalizedOptions: UpgradeOptions) {
		const skillWriter = this.feature.Writer('skill', {
			upgradeMode: normalizedOptions.upgradeMode,
		})
		const pkgService = this.feature.Service('pkg')
		const name = pkgService.get('name')
		const description = pkgService.get('description')

		const generatedFiles = await skillWriter.writeSkill(this.feature.cwd, {
			name,
			description,
			filesToSkip: ['package.json'],
		})

		return generatedFiles
	}
}
