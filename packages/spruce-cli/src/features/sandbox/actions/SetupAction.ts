import { buildSchema } from '@sprucelabs/schema'
import setupVscodeSchema from '#spruce/schemas/spruceCli/v2020_07_22/setupVscodeOptions.schema'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
	id: 'setupSandboxOptions',
	name: 'Setup sandbox options',
	fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class SetupAction extends AbstractAction<OptionsSchema> {
	public optionsSchema = setupVscodeSchema
	public invocationMessage = 'Setting up sandbox support... 🏝'

	public async execute(): Promise<FeatureActionResponse> {
		const createListenerAction = this.Action('event', 'listen')
		const results = await createListenerAction.execute({
			eventNamespace: 'skill',
			eventName: 'will-boot',
		})

		if (results.errors) {
			return results
		}

		const match = (results.files ?? []).find(
			(file) => file.name.search('will-boot') === 0
		)

		if (!match) {
			throw new Error('file was not generated')
		}

		match.description = 'Used for recovering from a sandbox reset.'

		await this.Writer('sandbox').writeDidBootListener(match.path)

		return results
	}
}
