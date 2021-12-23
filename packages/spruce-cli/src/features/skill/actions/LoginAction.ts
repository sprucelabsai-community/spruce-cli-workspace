import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import SpruceError from '../../../errors/SpruceError'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'
import { generateSkillSummaryLines } from './RegisterAction'

const optionsSchema = buildSchema({
	id: 'loginSkillAction',
	description:
		'If you already registered your skill but lost your env or changed environments.',
	fields: {
		skillSlug: {
			type: 'text',
			label: 'Namespace',
		},
	},
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class LoginAction extends AbstractAction<OptionsSchema> {
	public optionsSchema: OptionsSchema = optionsSchema
	public commandAliases = ['login.skill']
	public invocationMessage = 'Logging in as skill... ⚡️'

	public async execute(options: Options): Promise<FeatureActionResponse> {
		const { skillSlug } = this.validateAndNormalizeOptions(options)

		const person = this.Service('auth').getLoggedInPerson()
		let loginResponse: FeatureActionResponse = {}
		let skillResponse: FeatureActionResponse = {}

		if (!person) {
			this.ui.renderLine(
				'You gotta login as a person before you can login as a skill.'
			)

			const phone = await this.ui.prompt({
				type: 'phone',
				label: 'Phone number',
				isRequired: true,
			})

			loginResponse = await this.Action('person', 'login').execute({
				phone,
			})
		}

		const client = await this.connectToApi()
		const skillResults = await client.emit('list-skills::v2020_12_25', {
			payload: {
				shouldOnlyShowMine: true,
			},
		})

		let { skills } = eventResponseUtil.getFirstResponseOrThrow(skillResults)

		if (skillSlug) {
			const match = skills.find((s) => s.slug === skillSlug)

			if (!match) {
				return {
					errors: [
						new SpruceError({
							code: 'SKILL_NOT_FOUND',
							friendlyMessage: `I couldn't find a skill that you own with the slug: ${skillSlug}`,
						}),
					],
				}
			}

			skills = [match]
		}

		if (skills.length === 0) {
			const error = new SpruceError({ code: 'NO_SKILLS_REGISTERED' })

			if (error) {
				return {
					errors: [error],
				}
			}
		} else if (skills.length > 1) {
			const selectedSkillId = await this.ui.prompt({
				type: 'select',
				label: 'Which skill are we logging in as?',
				isRequired: true,
				options: {
					choices: skills.map((s) => ({
						label: s.name,
						value: s.id,
					})),
				},
			})

			skills = skills.filter((s) => s.id === selectedSkillId)
		}

		if (skills.length === 1) {
			const currentSkillResults = await client.emit('get-skill::v2020_12_25', {
				target: {
					skillId: skills[0].id,
				},
				payload: {
					shouldIncludeApiKey: true,
				},
			})

			const { skill } =
				eventResponseUtil.getFirstResponseOrThrow(currentSkillResults)

			this.Service('auth').updateCurrentSkill(skill)

			skillResponse.summaryLines = generateSkillSummaryLines(skill)
			skillResponse.meta = {
				skill,
			}
		}

		return actionUtil.mergeActionResults(loginResponse, skillResponse)
	}
}
