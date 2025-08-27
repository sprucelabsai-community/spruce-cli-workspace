import { buildSchema } from '@sprucelabs/schema'
import { versionUtil } from '@sprucelabs/spruce-skill-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'setupSandboxOptions',
    name: 'Setup sandbox options',
    fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class SetupAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public invocationMessage = 'Setting up sandbox support... 🏝'

    public async execute(): Promise<FeatureActionResponse> {
        const listeners = this.Store('listener')
        const existing = await listeners.loadListeners()
        const version = existing.find(
            (e) => e.eventNamespace === 'skill'
        )?.version

        const createListenerAction = this.Action('event', 'listen')
        const results = await createListenerAction.execute({
            namespace: 'skill',
            eventName: 'will-boot',
            version: version ?? versionUtil.generateVersion().dirValue,
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
