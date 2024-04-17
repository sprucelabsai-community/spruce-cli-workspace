import { Script } from '../../ScriptPlayer'

const script: Script = [
    'Look at us go! 😄',
    "I'm about to setup testing.",
    'Real testing.',
    'Remember the whole 3 Laws of Test Driven Development thing? You are def gonna wanna watch this before continuing -> https://youtu.be/qkblc5WRn-U',
    'Ok, getting down off my robot soapbox.',
    'Next thing I gotta do is install some more dependencies (I know right?).',
    'You ready to go?',
    async (player) => {
        await player.ui.waitForEnter('')
    },
]

export default script
