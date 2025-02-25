import TerminalInterface from './interfaces/TerminalInterface'
import CommandServiceImpl from './services/CommandService'
import GameService from './services/GameService'

export default class InFlightEntertainment {
    private static activeGameCount = 0
    private static game?: GameService

    public static setup(options: {
        command: CommandServiceImpl
        ui: TerminalInterface
    }) {
        this.game = new GameService(options.command, options.ui)
    }

    public static start(intro?: string[]) {
        if (this.activeGameCount > 0) {
            this.activeGameCount++
            return
        }
        this.activeGameCount = 1

        void this.game?.play(
            intro ?? [
                `I gotta install some dependencies to get things working.`,
                `This can be slow, so in the mean time, enjoy some games! 🤩`,
            ]
        )
    }

    public static writeStatus(message: string) {
        this.game?.setStatusMessage(`⏱  ${message}`)
    }

    public static stop() {
        this.activeGameCount--

        if (this.activeGameCount === 0) {
            this.game?.kill()
        }
    }
}
