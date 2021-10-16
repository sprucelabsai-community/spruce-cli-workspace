import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import namedTemplateItemBuilder from '../../../schemas/v2020_07_22/namedTemplateItem.builder'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'createLogTransportOptions',
	description:
		'Send logs wherever you want based on their severity. We like to send console.error to a Slack channel the team uses.',
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
	public optionsSchema = optionsSchema
	public invocationMessage = 'Creating a new log transport... ✍️'
	public commandAliases = ['create.log.transport']

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
