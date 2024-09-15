import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import FormComponent from '../../../components/FormComponent'
import namedTemplateItemBuilder from '../../../schemas/v2020_07_22/namedTemplateItem.builder'
import actionUtil from '../../../utilities/action.utility'
import formUtil from '../../../utilities/form.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

export default class CreateAction extends AbstractAction<OptionsSchema> {
    public optionsSchema: OptionsSchema = optionsSchema
    public commandAliases = ['create.view']
    public invocationMessage = 'Creating your new view controller... 🌲'

    public async execute(
        options: SchemaValues<OptionsSchema>
    ): Promise<FeatureActionResponse> {
        let { viewType, isRoot, nameReadable, namePascal, viewModel } =
            this.validateAndNormalizeOptions(options)

        const writer = this.Writer('view')

        const shouldAskAboutRootSvc =
            viewType === 'skillView' &&
            !isRoot &&
            !(await writer.doesRootControllerExist(this.cwd))

        if (shouldAskAboutRootSvc) {
            isRoot = await this.ui.confirm(
                'Do you want to create a root view controller?'
            )
        }

        if (!isRoot && !nameReadable) {
            const form = new FormComponent({
                ui: this.ui,
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
            nameKebab: namesUtil.toKebab(namePascal),
        })

        const syncResults = await this.Action('view', 'sync').execute({})

        const merged = actionUtil.mergeActionResults(
            {
                files,
            },
            syncResults
        )

        return merged
    }
}

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
    'BigForm',
    'Button',
    'Calendar',
    'Card',
    'CardBody',
    'CardHeader',
    'Dialog',
    'Form',
    'List',
    'CalendarEvent',
].sort()

const optionsSchema = buildSchema({
    id: 'createViewOptions',
    description:
        'Create a new Heartwood view to render on web enabled and mobile devices.',
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
                choices: viewModels.map((model) => ({
                    value: model,
                    label: model,
                })),
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
