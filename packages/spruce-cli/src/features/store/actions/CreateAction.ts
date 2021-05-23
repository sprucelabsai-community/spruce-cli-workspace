import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import namedTemplateItemBuilder from '../../../schemas/v2020_07_22/namedTemplateItem.builder'
import mergeUtil from '../../../utilities/merge.utility'
import AbstractFeatureAction from '../../AbstractFeatureAction'

const optionsSchema = buildSchema({
	id: 'createStoreOptions',
	description:
		'Create a place to store data. Can be a database, can be memory, can be a spreadsheet. If you need to store data, do it here.',
	fields: {
		nameReadable: {
			...namedTemplateItemBuilder.fields.nameReadable,
			label: 'Store name (singular)',
			hint: 'Make it easy to read and singlar, e.g. Person or Bid',
		},
		nameReadablePlural: {
			...namedTemplateItemBuilder.fields.nameReadablePlural,
			label: 'Store name (plural)',
			hint: 'Make it easy to read and plural, e.g. People or Bids',
		},
		namePascal: {
			...namedTemplateItemBuilder.fields.namePascal,
			isRequired: true,
		},
		namePascalPlural: namedTemplateItemBuilder.fields.namePascalPlural,
		nameSnakePlural: namedTemplateItemBuilder.fields.nameSnakePlural,
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class CreateAction extends AbstractFeatureAction<OptionsSchema> {
	public optionsSchema = optionsSchema
	public code = 'create'

	public async execute(options: Options) {
		const {
			namePascal,
			namePascalPlural,
			nameSnakePlural,
			nameReadablePlural,
		} = this.validateAndNormalizeOptions(options)

		const writer = this.Writer('store')

		try {
			const files = await writer.writeStore(this.cwd, {
				namePascal,
				namePascalPlural:
					namePascalPlural ?? namesUtil.toPascal(nameReadablePlural),
				nameSnakePlural:
					nameSnakePlural ?? namesUtil.toSnake(nameReadablePlural),
			})

			const syncResults = await this.Action('sync').execute({})

			return mergeUtil.mergeActionResults(syncResults, {
				files,
			})
		} catch (err) {
			return {
				errors: [err],
			}
		}
	}
}
