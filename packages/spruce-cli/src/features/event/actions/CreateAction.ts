import {
	buildSchema,
	normalizeSchemaValues,
	SchemaValues,
} from '@sprucelabs/schema'
import { eventNameUtil } from '@sprucelabs/spruce-event-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import syncEventActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/syncEventOptions.schema'
import SpruceError from '../../../errors/SpruceError'
import namedTemplateItemBuilder from '../../../schemas/v2020_07_22/namedTemplateItem.builder'
import syncEventActionBuilder from '../../../schemas/v2020_07_22/syncEventOptions.builder'
import mergeUtil from '../../../utilities/merge.utility'
import AbstractFeatureAction from '../../AbstractFeatureAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'createEventAction',
	fields: {
		nameReadable: {
			...namedTemplateItemBuilder.fields.nameReadable,
			isRequired: true,
		},
		nameKebab: {
			...namedTemplateItemBuilder.fields.nameKebab,
			label: 'Event name',
			isRequired: true,
		},
		nameCamel: {
			...namedTemplateItemBuilder.fields.nameCamel,
			isRequired: true,
		},
		isGlobal: {
			type: 'boolean',
			label: 'Is this a global event?',
			hint: "This will allow skills to listen without being installed at the same organization. You'll need permission to make this happen.",
		},
		version: {
			type: 'text',
			label: 'Version',
			isPrivate: true,
		},
		...syncEventActionBuilder.fields,
	},
})

type OptionsSchema = typeof optionsSchema

export default class CreateAction extends AbstractFeatureAction<OptionsSchema> {
	public code = 'create'
	public optionsSchema: OptionsSchema = optionsSchema

	public async execute(
		options: SchemaValues<OptionsSchema>
	): Promise<FeatureActionResponse> {
		let { nameKebab, nameReadable, nameCamel, version, isGlobal } =
			this.validateAndNormalizeOptions(options)

		const skill = await this.Store('skill').loadCurrentSkill()

		if (!skill.id || !skill.slug) {
			return {
				errors: [new SpruceError({ code: 'SKILL_NOT_REGISTERED' })],
			}
		}

		try {
			const destinationDir = diskUtil.resolvePath(this.cwd, 'src', 'events')
			const resolvedVersion = await this.resolveVersion(version, destinationDir)

			const files = await this.Writer('event').writeEvent(destinationDir, {
				nameKebab,
				nameCamel,
				version: resolvedVersion,
				nameReadable,
				isGlobal,
			})

			const syncOptions = normalizeSchemaValues(
				syncEventActionSchema,
				options,
				{
					includePrivateFields: true,
				}
			)

			const syncResponse = await this.parent.Action('sync').execute(syncOptions)

			const fqen = eventNameUtil.join({
				eventName: nameKebab,
				eventNamespace: skill.slug,
				version: resolvedVersion,
			})

			return mergeUtil.mergeActionResults(
				{ files, meta: { fqen } },
				syncResponse
			)
		} catch (err) {
			return {
				errors: [err],
			}
		}
	}
}
