import { buildSchema } from '@sprucelabs/schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export const nodeFeatureSchema = buildSchema({
	id: 'nodeFeatureOptions',
	name: 'Node feature options',
	fields: {
		destination: {
			type: 'text',
			defaultValue: '.',
		},
		name: {
			type: 'text',
			isRequired: true,
			label: "What's the name of your module?",
		},
		description: {
			type: 'text',
			isRequired: true,
			label: 'How would you describe your module?',
		},
	},
})

const optionsSchema = buildSchema({
	id: 'createNodeModule',
	name: 'create skill',
	description: 'A node module, in typescript, ready to rock!',
	fields: {
		...nodeFeatureSchema.fields,
	},
})

type OptionsSchema = typeof optionsSchema

export default class CreateAction extends AbstractAction<OptionsSchema> {
	public invocationMessage = 'Setting up a new mode module! 🤖'
	public optionsSchema = optionsSchema
	public async execute(): Promise<FeatureActionResponse> {
		return {
			hints: ['Your new module is ready!'],
		}
	}
}
