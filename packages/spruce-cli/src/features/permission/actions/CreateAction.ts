import { buildSchema, pickFields, SchemaValues } from '@sprucelabs/schema'
import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import namedTemplateItemSchema from '#spruce/schemas/spruceCli/v2020_07_22/namedTemplateItem.schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class CreateAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = schema
	public invocationMessage = 'Creating a permission contract... 🛡'
	public readonly commandAliases: string[] = [
		'create.permissions',
		'create.permission',
	]

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { nameKebab, nameReadable, nameCamel, description } =
			this.validateAndNormalizeOptions(options)

		const destination = diskUtil.resolvePath(this.cwd, 'src', 'permissions')

		const writer = this.Writer('permission')
		const files = await writer.writeContract(destination, {
			nameKebab: nameKebab ?? namesUtil.toKebab(nameReadable),
			nameReadable,
			nameCamel,
			description,
		})

		return {
			files,
		}
	}
}

const schema = buildSchema({
	id: 'createPermission',
	fields: {
		nameReadable: {
			...namedTemplateItemSchema.fields.nameReadable,
			label: `Name your permission contract`,
			hint: `A contract contains many permissions grouped by a responsibility`,
		},
		...pickFields(namedTemplateItemSchema.fields, ['nameCamel', 'nameKebab']),
		description: {
			...namedTemplateItemSchema.fields.description,
			label: `Describe this contract`,
		},
	},
})

type OptionsSchema = typeof schema
type Options = SchemaValues<OptionsSchema>
