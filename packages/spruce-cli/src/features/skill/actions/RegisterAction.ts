import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import { RegisteredSkill } from '../../../types/cli.types'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'registerSkillAction',
	description:
		'Register your skill with Mercury so you can start communicating with other skills.',
	fields: {
		nameReadable: {
			type: 'text',
			label: `What is your skill's name?`,
			isRequired: true,
		},
		nameKebab: {
			type: 'text',
			label: 'Namespace',
			isRequired: true,
		},
		description: {
			type: 'text',
			label: 'Describe your skill',
		},
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class RegisterAction extends AbstractAction<OptionsSchema> {
	public optionsSchema: OptionsSchema = optionsSchema
	public commandAliases = ['register.skill', 'register']
	public invocationMessage = 'Registering your skill... ⚡️'

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { nameReadable, nameKebab, description } =
			this.validateAndNormalizeOptions(options)

		const client = await this.connectToApi()
		const results = await client.emit('register-skill::v2020_12_25', {
			payload: {
				name: nameReadable,
				slug: nameKebab,
				description,
			},
		})

		try {
			const { skill } = eventResponseUtil.getFirstResponseOrThrow(results)

			const summaryLines = generateSkillSummaryLines(skill)

			this.Service('auth').updateCurrentSkill(skill)

			return {
				summaryLines,
				hints: [
					'Your skill is registered.',
					'You can check your .env for more details.',
					"If you're ready to deploy, try `spruce deploy`. 🚀",
				],
				meta: {
					skill,
				},
			}
		} catch (err) {
			return {
				hints: [
					`If you've already registered your skill, try 'spruce login.skill'!`,
				],
				errors: [err],
			}
		}
	}
}

export function generateSkillSummaryLines(skill: RegisteredSkill) {
	return [
		`Name: ${skill.name}`,
		`Slug: ${skill.slug}`,
		`ID: ${skill.id}`,
		`API Key: ${skill.apiKey}`,
	]
}
