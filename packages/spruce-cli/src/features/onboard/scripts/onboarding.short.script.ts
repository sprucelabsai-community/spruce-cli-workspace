import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { GraphicsInterface } from '../../../types/cli.types'
import { GraphicsTextEffect } from '../../../types/graphicsInterface.types'
import featuresUtil from '../../feature.utilities'
import { CallbackPlayer, Script } from '../ScriptPlayer'

const script: Script = [
    async (player) => {
        player.ui.clear()
        await renderEnter(player)
    },
    "You push the door open and enter into the largest room you've ever seen.",
    "So big, in fact, you can't see where the floors end and the walls begin.",
    'A familiar voice echos...',
    '"Hey! It\'s Sprucebot again! 🌲🤖"',
    async (player) => {
        const line = `This is so much fun! I love playing both the narrator and a character!`
        player.ui.renderLine(line, [GraphicsTextEffect.Italic])
        player.ui.renderLine('')
    },
    'Anyway... "How about we create a simple todo app."',
    '"Go ahead and run"',
    async (player) => {
        renderCommand(player.ui, 'spruce create.skill todos')
    },

    '"Tip! If you ever get lost, just run"',
    async (player) => {
        renderCommand(player.ui, `spruce onboard`)
    },
    '"and I\'ll get you back on track."',
    async (player) => {
        await player.ui.waitForEnter('"Lets do it!"')

        player.onboardingStore.setMode('short')
        player.onboardingStore.setStage(
            featuresUtil.generateCommand('skill', 'create') as 'create.skill'
        )
    },
]

export function renderEnter(player: CallbackPlayer) {
    return player.ui.renderImage(
        diskUtil.resolvePath(__dirname, '../../../../docs/images/inside.jpg'),
        {
            width: 100,
            height: 35,
        }
    )
}

export function renderCommand(ui: GraphicsInterface, command: string) {
    ui.renderLine(command, [
        GraphicsTextEffect.BgMagenta,
        GraphicsTextEffect.White,
    ])
    ui.renderLine('')
}

export default script
