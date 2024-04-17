import ScriptPlayer, { Script } from '../../../features/onboard/ScriptPlayer'

const firstScript: Script = [
    'hello world',
    async (player) => {
        await player.executeCommand('first script command executed')
    },
    ScriptPlayer.redirect('second'),
]

export default firstScript
