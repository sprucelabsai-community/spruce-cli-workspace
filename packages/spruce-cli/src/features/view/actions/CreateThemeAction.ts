import { buildSchema, SchemaValues } from '@sprucelabs/schema'
import SpruceError from '../../../errors/SpruceError'
import actionUtil from '../../../utilities/action.utility'
import AbstractAction from '../../AbstractAction'

const optionsSchema = buildSchema({
    id: 'createThemeOptions',
    description: 'Create a theme for your skill.',
    fields: {},
})

type OptionsSchema = typeof optionsSchema

export default class CreateThemeAction extends AbstractAction<OptionsSchema> {
    public optionsSchema = optionsSchema
    public commandAliases = ['create.theme']
    public invocationMessage = `Let's get pretty! 🤩`

    public async execute(_options: SchemaValues<OptionsSchema>) {
        const writer = this.Writer('view')

        if (writer.doesThemeFileExist(this.cwd)) {
            return {
                errors: [
                    new SpruceError({
                        code: 'THEME_EXISTS',
                    }),
                ],
            }
        }

        const events = this.getFeature('event')
        let syncResults = {}

        if (!events.hasBeenSynced()) {
            syncResults = await this.Action('event', 'sync').execute({})
        }

        const files = await writer.writeTheme(this.cwd)
        const results = { files }

        return actionUtil.mergeActionResults(syncResults, results)
    }
}
