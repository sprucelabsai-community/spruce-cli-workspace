import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import createErrorActionSchema from '#spruce/schemas/spruceCli/v2020_07_22/createErrorOptions.schema'
import namedTemplateItemBuilder from '../../../schemas/v2020_07_22/namedTemplateItem.builder'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'createLogTransportOptions',
	fields: {
		nameReadable: {
			type: 'text',
			label: 'What is the name of your transport?',
			isRequired: true,
			hint: 'E.g. Slack or Email',
		},
		nameCamel: namedTemplateItemBuilder.fields.nameCamel,
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class CreateLogTransportAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = createErrorActionSchema
	public invocationMessage = 'Creating a new log transport... ✍️'

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { nameCamel, nameReadable } =
			this.validateAndNormalizeOptions(options)

		const file = await this.Writer('log').writeTransportPlugin(this.cwd, {
			nameCamel,
			nameReadable,
		})

		return {
			files: [file],
		}
	}
}
