import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { Script } from '../ScriptPlayer'
import {
    renderDoors,
    chooseOnboardingAdventure,
} from './onboarding.first.script'

const script: Script = [
    async (player) => {
        player.ui.clear()
        await player.ui.renderImage(
            diskUtil.resolvePath(
                __dirname,
                '../../../../docs/images/listen.jpg'
            ),
            {
                width: 100,
                height: 23,
            }
        )
    },
    'You approach the "Immersive" door and grab the handle...',
    "It won't budge no matter how hard you try.",
    'You hear a sound, so you put your ear to the door.',
    'From the other side, someone yells, "Work in progress. Try the door on the left! Thaaaaaanks!!"',
    'You back away...',
    async (player) => {
        await player.ui.waitForEnter()
        player.ui.clear()
        await renderDoors(player.ui)
        return chooseOnboardingAdventure(player)
    },
]

export default script
