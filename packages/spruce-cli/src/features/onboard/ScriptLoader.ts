import pathUtil from 'path'
import globby from '@sprucelabs/globby'
import { GraphicsInterface } from '../../types/cli.types'
import ScriptPlayer, { CommandExecuter } from './ScriptPlayer'
import OnboardingStore from './stores/OnboardingStore'

export default class ScriptLoader {
    public static async LoadScripts(options: {
        dir: string
        ui: GraphicsInterface
        onboardingStore: OnboardingStore
        commandExecuter: CommandExecuter
    }) {
        const player = new ScriptPlayer({
            ui: options.ui,
            onboardingStore: options.onboardingStore,
            commandExecuter: options.commandExecuter,
        })

        const scripts = await globby(options.dir + '/**/*.script.js')

        for (const file of scripts) {
            const name = pathUtil.basename(file)
            const search = '.script' + pathUtil.extname(name)
            const key = name.replace(search, '')
            const script = require(file).default

            player.loadScript(key, script)
        }

        return player
    }
}
