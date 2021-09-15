import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { SpruceSchemas } from '#spruce/schemas/schemas.types'
import SpruceError from '../../../errors/SpruceError'
import { GlobalEmitter } from '../../../GlobalEmitter'
import AbstractFeature from '../../AbstractFeature'

type UpgradeOptions = SpruceSchemas.SpruceCli.v2020_07_22.UpgradeSkillOptions

type Feature =
	AbstractFeature<SpruceSchemas.SpruceCli.v2020_07_22.SkillFeatureSchema>

export default class Updater {
	private feature: Feature
	private emitter: GlobalEmitter

	public constructor(skill: Feature, emitter: GlobalEmitter) {
		this.emitter = emitter
		this.feature = skill
	}

	public async updateFiles(normalizedOptions: UpgradeOptions) {
		const skillWriter = this.feature.Writer('skill', {
			upgradeMode: normalizedOptions.upgradeMode,
		})
		const pkgService = this.feature.Service('pkg')
		const name = pkgService.get('name')
		const description = pkgService.get('description')

		const results = await this.emitter.emit(
			'skill.will-write-directory-template'
		)

		const { payloads } = eventResponseUtil.getAllResponsePayloadsAndErrors(
			results,
			SpruceError
		)

		const filesToSkip = ['package.json']

		for (const payload of payloads) {
			if (payload.filesToSkip) {
				filesToSkip.push(...payload.filesToSkip)
			}
		}

		const generatedFiles = await skillWriter.writeSkill(this.feature.cwd, {
			name,
			description,
			filesToSkip,
		})

		return generatedFiles
	}
}
