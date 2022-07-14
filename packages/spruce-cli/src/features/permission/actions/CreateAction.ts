import { buildSchema, pickFields, SchemaValues } from '@sprucelabs/schema'
import namedTemplateItemSchema from '#spruce/schemas/spruceCli/v2020_07_22/namedTemplateItem.schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const schema = buildSchema({
	id: 'createPermission',
	fields: {
		...pickFields(namedTemplateItemSchema.fields, [
			'nameReadable',
			'nameKebab',
		]),
	},
})

type OptionsSchema = typeof schema
type Options = SchemaValues<OptionsSchema>

export default class CreateAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = schema
	public invocationMessage = 'Creating a permission contract... 🛡'

	public async execute(_options: Options): Promise<FeatureActionResponse> {
		// const { nameKebab, nameReadable } =
		// 	this.validateAndNormalizeOptions(options)

		return {}
	}
}
