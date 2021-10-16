import { buildSchema } from '@sprucelabs/schema'
import { eventResponseUtil } from '@sprucelabs/spruce-event-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'whoAmI',
	description: "Check who you're logged in as.",
	fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class WhoAmIAction extends AbstractAction<OptionsSchema> {
	public optionsSchema: OptionsSchema = optionsSchema
	public commandAliases = ['whoami']
	public invocationMessage = 'Determining identity... 🤝'

	public async execute(): Promise<FeatureActionResponse> {
		const client = await this.connectToApi()

		const results = await client.emit('whoami::v2020_12_25')
		const { type, auth } = eventResponseUtil.getFirstResponseOrThrow(results)

		const summaryLines: string[] = []

		if (type === 'anonymous') {
			summaryLines.push('You are not logged in.')
		} else if (auth.person) {
			summaryLines.push(`You are logged in as a person.`)
			summaryLines.push(`Name: ${auth.person.casualName}`)
		}

		return {
			summaryLines,
		}
	}
}
