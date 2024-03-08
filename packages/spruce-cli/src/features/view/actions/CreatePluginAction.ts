import { SchemaValues, buildSchema } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import namedTemplateItemBuilder from '../../../schemas/v2020_07_22/namedTemplateItem.builder'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class CreatePluginAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = optionsSchema
	public invocationMessage = 'Creating a new view plugin... 🖼️'
	public commandAliases: string[] = ['create.view.plugin']

	public async execute(
		options: SchemaValues<OptionsSchema>
	): Promise<FeatureActionResponse> {
		const { nameReadable, nameCamel, namePascal } =
			this.validateAndNormalizeOptions(options)

		const normalizedNameCamel = nameCamel ?? namesUtil.toCamel(nameReadable)
		const normalizedNamePascal =
			namePascal ?? namesUtil.toPascal(normalizedNameCamel)

		const writer = this.Writer('view')
		const files = await writer.writeViewControllerPlugin({
			cwd: this.cwd,
			nameCamel: normalizedNameCamel,
			namePascal: normalizedNamePascal,
		})

		return {
			files,
		}
	}
}

const optionsSchema = buildSchema({
	id: 'createViewPluginOptions',
	fields: {
		nameReadable: {
			...namedTemplateItemBuilder.fields.nameReadable,
			label: 'Plugin name',
		},
		nameCamel: {
			...namedTemplateItemBuilder.fields.nameCamel,
			isRequired: false,
		},
		namePascal: {
			...namedTemplateItemBuilder.fields.namePascal,
			isRequired: false,
		},
	},
})

type OptionsSchema = typeof optionsSchema
