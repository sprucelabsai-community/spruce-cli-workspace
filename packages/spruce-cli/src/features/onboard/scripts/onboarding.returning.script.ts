import { Script } from '../ScriptPlayer'
import { renderCommand, renderEnter } from './onboarding.short.script'

const script: Script = [
    (player) => player.ui.clear(),
    (player) => renderEnter(player),
    'You return to the doors in the forest and enter the one on the left.',
    '"Welcome back!", shouts Sprucebot.',
    '"It looks like you\'re supposed to be running"',
    (player) => {
        const stage = player.onboardingStore.getStage()
        renderCommand(player.ui, `spruce ${stage}`)
    },
    async (player) => {
        const stage = player.onboardingStore.getStage()
        const answer = await player.ui.prompt({
            type: 'select',
            label: "Lemme know what you'd like to do",
            options: {
                choices: [
                    {
                        label: `Run \`spruce ${stage}\` for me!`,
                        value: 'run',
                    } as const,
                    {
                        label: `Start over`,
                        value: 'startOver',
                    } as const,
                    {
                        label: `Stop onboarding`,
                        value: 'stop',
                    } as const,
                ],
            },
        })

        switch (answer) {
            case 'startOver':
                player.onboardingStore.reset()
                player.ui.clear()
                return player.redirect('onboarding.first')
            case 'stop':
                player.onboardingStore.reset()
                break
            case 'run':
                await player.executeCommand(stage as string)
                break
        }

        return
    },
]

export default script
