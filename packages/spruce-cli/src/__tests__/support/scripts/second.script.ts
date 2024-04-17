import { Script } from '../../../features/onboard/ScriptPlayer'

const secondScript: Script = [
    'second script',
    (player) => player.redirect('third.test'),
]

export default secondScript
