import { Schema } from '@sprucelabs/schema'
import { CLI_HERO } from '../constants'
import { FeatureAction } from '../features/features.types'
import { GraphicsInterface } from '../types/cli.types'

const uiUtil = {
    renderActionMastHead(ui: GraphicsInterface, action: FeatureAction<Schema>) {
        return this.renderMasthead({
            ui,
            headline: action.invocationMessage,
        })
    },

    renderMasthead(options: {
        ui: GraphicsInterface
        hero?: string
        headline: string
    }) {
        const { ui, hero, headline } = options

        ui.clear()
        ui.renderHero(hero ?? CLI_HERO)
        ui.renderHeadline(headline)
    },
}

export default uiUtil
