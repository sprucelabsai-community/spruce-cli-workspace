import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { nodeFeatureSchema } from '../NodeFeature'

const optionsSchema = buildSchema({
	id: 'createSkill',
	name: 'create skill',
	description:
		'A skill is a micro-app, focused on delivering personaziled (and discrete) experiences.',
	fields: {
		...nodeFeatureSchema.fields,
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class CreateAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Setting up a new mode module! 🤖'
	public optionsSchema = optionsSchema
	public async execute(options: Options): Promise<FeatureActionResponse> {
		return {}
	}
}
