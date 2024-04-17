import { Script } from '../ScriptPlayer'
import { renderCommand } from './onboarding.short.script'

const script: Script = [
    'Hold on! ✋',
    "I don't think you're supposed to be here!",
    'I was really expecting you to run:',
    (player) => {
        renderCommand(player.ui, player.onboardingStore.getStage() as string)
    },
    'But you are in a completely different place.',
    async (player) => {
        const stage = player.onboardingStore.getStage() as string
        const answer = await player.ui.prompt({
            type: 'select',
            label: 'What should we do?',
            options: {
                choices: [
                    {
                        label: 'Continue forward',
                        value: 'letMePass',
                    } as const,
                    {
                        label: 'Stop onboarding',
                        value: 'disable',
                    } as const,
                    {
                        label: `Execute \`${stage}\``,
                        value: 'executeCommand',
                    } as const,
                ],
            },
        })

        switch (answer) {
            case 'disable':
                player.onboardingStore.reset()
                player.ui.renderLine('')
                player.ui.renderLine(
                    `Ok, I've disabled onboarding for now. Hope to see you again soon!`
                )
                player.ui.renderLine('')

            case 'letMePass':
                await player.ui.waitForEnter('As you were!')
                break
            default:
                throw new Error(
                    'Coming soon! For now you have to manually run!'
                )
        }
    },
]

export default script
