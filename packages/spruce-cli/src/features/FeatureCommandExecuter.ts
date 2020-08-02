import { ISchema, SchemaPartialValues, SchemaValues } from '@sprucelabs/schema'
import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import FormComponent from '../components/FormComponent'
import { IGraphicsInterface } from '../types/cli.types'
import FeatureInstaller from './FeatureInstaller'
import { FeatureCode, IFeatureMap } from './features.types'

type FeatureCommandExecuteOptions<
	F extends FeatureCode
> = IFeatureMap[F]['optionsDefinition'] extends ISchema
	? SchemaPartialValues<IFeatureMap[F]['optionsDefinition']>
	: undefined

export default class FeatureCommandExecuter<F extends FeatureCode> {
	private featureCode: F
	private actionCode: string
	private term: IGraphicsInterface
	private featureInstaller: FeatureInstaller

	public constructor(options: {
		term: IGraphicsInterface
		featureCode: F
		actionCode: string
		featureInstaller: FeatureInstaller
	}) {
		this.featureCode = options.featureCode
		this.actionCode = options.actionCode
		this.term = options.term
		this.featureInstaller = options.featureInstaller
	}

	public async execute(options?: FeatureCommandExecuteOptions<F>) {
		const feature = this.featureInstaller.getFeature(this.featureCode)
		const action = feature.Action(this.actionCode)

		if (feature.optionsDefinition) {
			this.term.stopLoading()

			const isInstalled = await this.featureInstaller.isInstalled(
				this.featureCode
			)

			if (!isInstalled) {
				const answers = await this.collectAnswers(
					feature.optionsDefinition,
					options
				)

				this.term.startLoading(`Installing ${this.featureCode}...`)

				await this.featureInstaller.install({
					features: [
						// @ts-ignore
						{
							code: this.featureCode,
							//@ts-ignore
							options: { ...options, ...answers },
						},
					],
				})
			}
		}

		const definition = action.optionsSchema
		let answers

		if (definition) {
			answers = await this.collectAnswers(definition, options)
		}

		// @ts-ignore
		const results = await action.execute(answers)

		this.term.stopLoading()

		this.term.renderCommandSummary({
			featureCode: this.featureCode,
			actionCode: this.actionCode,
			...results,
		})
	}

	private async collectAnswers<S extends ISchema>(
		definition: S,
		options: FeatureCommandExecuteOptions<F> | undefined
	) {
		const featureForm = new FormComponent({
			term: this.term,
			definition,
			initialValues: options,
			//@ts-ignore
			onWillAskQuestion: namesUtil.onWillAskQuestionHandler.bind(namesUtil),
		})

		const fieldNames = Object.keys(definition.fields ?? {})
		const providedFieldNames = options ? Object.keys(options ?? {}) : []
		const fieldsToPresent = fieldNames.filter(
			(name) =>
				providedFieldNames.indexOf(name) === -1 &&
				definition.fields?.[name].isPrivate !== true
		)
		let answers = {}
		if (fieldsToPresent.length > 0) {
			answers = await featureForm.present({
				showOverview: false,
				// @ts-ignore
				fields: fieldsToPresent,
			})
		}
		return { ...(options ?? {}), ...answers } as SchemaValues<S>
	}
}
