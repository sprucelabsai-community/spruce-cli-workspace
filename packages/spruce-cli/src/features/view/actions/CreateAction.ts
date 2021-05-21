import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import FormComponent from '../../../components/FormComponent'
import namedTemplateItemBuilder from '../../../schemas/v2020_07_22/namedTemplateItem.builder'
import formUtil from '../../../utilities/form.utility'
import AbstractFeatureAction from '../../AbstractFeatureAction'
import { FeatureActionResponse } from '../../features.types'

const viewTypeChoices = [
	{
		value: 'skillView',
		label: 'Skill View Controller',
	},
	{
		value: 'view',
		label: 'View Controller',
	},
]

const viewModels = [
	'Button',
	'Dialog',
	'Card',
	'CardBody',
	'CardHeader',
	'Form',
	'BigForm',
].sort()

const optionsSchema = buildSchema({
	id: 'createViewOptions',
	fields: {
		viewType: {
			type: 'select',
			label: 'Which are you creating?',
			isRequired: true,
			options: {
				choices: viewTypeChoices,
			},
		},
		isRoot: {
			type: 'boolean',
			label: 'Make this the Root View Controller?',
		},
		nameReadable: {
			...namedTemplateItemBuilder.fields.nameReadable,
			label: 'Controller name',
			isRequired: false,
		},
		namePascal: {
			...namedTemplateItemBuilder.fields.namePascal,
			isRequired: false,
		},
		viewModel: {
			type: 'select',
			label: 'View model',
			hint: 'Which type of view will your controller render?',
			options: {
				choices: viewModels.map((model) => ({ value: model, label: model })),
			},
		},
	},
})

const followUpSchema = buildSchema({
	id: 'creatViewFollowup',
	fields: {
		nameReadable: {
			...optionsSchema.fields.nameReadable,
			isRequired: true,
		},
		namePascal: {
			...optionsSchema.fields.namePascal,
			isRequired: true,
		},
	},
})

type OptionsSchema = typeof optionsSchema

export default class CreateAction extends AbstractFeatureAction<OptionsSchema> {
	public code = 'create'
	public optionsSchema: OptionsSchema = optionsSchema
	public commandAliases = ['create.view']

	public async execute(
		options: SchemaValues<OptionsSchema>
	): Promise<FeatureActionResponse> {
		let { viewType, isRoot, nameReadable, namePascal, viewModel } =
			this.validateAndNormalizeOptions(options)

		const writer = this.Writer('view')

		if (
			viewType === 'skillView' &&
			!isRoot &&
			!writer.doesRootControllerExist(this.cwd)
		) {
			isRoot = await this.ui.confirm(
				'Do you want to create a root view controller?'
			)
		}

		if (!isRoot && !nameReadable) {
			const form = new FormComponent({
				term: this.ui,
				schema: followUpSchema,
				onWillAskQuestion: formUtil.onWillAskQuestionHandler,
			})
			const answers = await form.present()

			namePascal = answers.namePascal
			nameReadable = answers.nameReadable
		}

		if (isRoot) {
			nameReadable = 'Root'
		}

		if (!viewModel && viewType === 'view') {
			viewModel = await this.ui.prompt({
				...optionsSchema.fields.viewModel,
				isRequired: true,
			})
		}

		namePascal = namePascal ?? namesUtil.toPascal(nameReadable as string)

		const files = await writer[
			viewType === 'skillView'
				? 'writeSkillViewController'
				: 'writeViewController'
		](this.cwd, {
			viewType,
			namePascal,
			viewModel: viewModel as string,
			name: namePascal,
		})

		return {
			files,
		}
	}
}