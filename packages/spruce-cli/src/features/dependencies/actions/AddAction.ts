import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import SpruceError from '../../../errors/SpruceError'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'addDepnedency',
	description: 'Add a skill as a dependency.',
	fields: {
		namespace: {
			type: 'id',
			label: 'Namespace',
			hint: 'The namespace of the skill you want to add as a dependency.',
		},
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class DeployAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = optionsSchema
	public commandAliases = ['add.dependency [namespace]']
	public invocationMessage = 'Adding a dependency... 🔗'

	public async execute(options: Options): Promise<FeatureActionResponse> {
		let { namespace } = this.validateAndNormalizeOptions(options)

		const skills = await this.Store('skill').fetchAllSkills()
		const dependencyService = this.Service('dependency')

		if (!namespace) {
			const dependencies = dependencyService.get().map((d) => d.namespace)

			const choices = skills
				.filter((s) => dependencies.indexOf(s.slug) === -1)
				.map((s) => ({
					value: s.slug,
					label: s.name,
				}))

			namespace = await this.ui.prompt({
				type: 'select',
				label: 'Which skill would you like to add as a dependency?',
				isRequired: true,
				options: {
					choices,
				},
			})
		}

		const skill = skills.find((s) => s.slug === namespace)

		if (!skill) {
			throw new SpruceError({
				code: 'SKILL_NOT_FOUND',
				friendlyMessage: `I could not find a skill with the slug of ${namespace}.`,
			})
		}

		dependencyService.add({
			id: skill.id,
			namespace: skill.slug,
		})

		const summaryLines = [`Added "${skill.name}" as a dependency!`]
		const isEventInstalled = await this.features.isInstalled('event')
		if (isEventInstalled) {
			summaryLines.push(
				'You will need to run `spruce sync.events` before accessing any new events.'
			)
		}

		return {
			summaryLines,
		}
	}
}
