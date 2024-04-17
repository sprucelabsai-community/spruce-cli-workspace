import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import { Remote } from '@sprucelabs/spruce-event-utils'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'setRemoteOptions',
    description: 'Point your skill to different Mercury environments.',
    fields: {
        remote: {
            label: 'Set remote',
            hint: 'Start with developer and read more here: https://developer.spruce.bot/#/skills/index',
            type: 'select',
            isRequired: true,
            options: {
                choices: [
                    {
                        value: 'local',
                        label: 'Local',
                    },
                    {
                        value: 'demo',
                        label: 'Demo',
                    },
                    {
                        value: 'developer',
                        label: 'Development',
                    },
                    {
                        value: 'sandbox',
                        label: 'Sandbox',
                    },
                    {
                        value: 'polish',
                        label: 'Polish',
                    },
                    {
                        value: 'production',
                        label: 'Production',
                    },
                ],
            },
        },
    },
})

type OptionsSchema = typeof optionsSchema
type Options = SchemaValues<OptionsSchema>

export default class SyncAction extends AbstractAction<OptionsSchema> {
    public commandAliases = ['set.remote [remote]']
    public optionsSchema: OptionsSchema = optionsSchema
    public invocationMessage = 'Set remote... 🜒'

    public async execute(options: Options): Promise<FeatureActionResponse> {
        const { remote } = this.validateAndNormalizeOptions(options)

        const r = this.Service('remote')
        r.set(remote as Remote)

        return {
            summaryLines: [`Remote: ${remote}`, `Host: ${r.getHost()}`],
        }
    }
}
