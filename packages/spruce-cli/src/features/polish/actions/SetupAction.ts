import { buildSchema } from '@sprucelabs/schema'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import ScriptUpdaterImpl from '../../../updaters/ScriptUpdater'
import AbstractAction from '../../AbstractAction'
import { FeatureActionResponse } from '../../features.types'

const optionsSchema = buildSchema({
    id: 'setupPolishAction',
    fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class SetupAction extends AbstractAction<OptionsSchema> {
    public optionsSchema: OptionsSchema = optionsSchema
    public invocationMessage = 'Setting up polish... ✨'

    public async execute(): Promise<FeatureActionResponse> {
        const namespace = await this.Store('skill').loadCurrentSkillsNamespace()
        const writer = this.Writer('polish')
        const files = await writer.writePolishScript(
            diskUtil.resolvePath(this.cwd, 'src'),
            namespace
        )

        const scriptUpdater = ScriptUpdaterImpl.FromFeature(this.parent, {
            cwd: this.cwd,
        })

        await scriptUpdater.update()

        return {
            files,
        }
    }
}
