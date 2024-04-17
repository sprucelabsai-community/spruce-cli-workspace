import { Script } from '../../ScriptPlayer'

const script: Script = [
    'Great work!',
    "I'm going to walk you through creating a skill.",
    "Because we follow the 3 Laws of Test Driven Development (https://bit.ly/3ls9phs), we're going to get all the way to our first failing test.",
    'First step, you gotta name your skill.',
    "Let's call it 'Todos' to start.",
    'The description is up to you!',
    "I'll meet you on the other side!",
    async (player) => {
        await player.ui.waitForEnter('')
        player.onboardingStore.setStage('test')
    },
]

export default script
