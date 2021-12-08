import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import TerminalInterface from '../interfaces/TerminalInterface'
import CommandService from './CommandService'

export default class GameService {
	private command: CommandService
	private ui: TerminalInterface
	private statusMessage?: string
	private killed = false

	public constructor(command: CommandService, ui: TerminalInterface) {
		this.command = command
		this.ui = ui
		this.command.cwd = diskUtil.resolvePath(__dirname, '../../')
	}

	public setStatusMessage(message: string) {
		this.statusMessage = message
	}

	public async play(introductionSentences: string[] = []) {
		const sentencesToPlay = [...introductionSentences]
		await this.ui.stopLoading()
		this.killed = false

		while (sentencesToPlay.length > 0) {
			const next = sentencesToPlay.shift() as string
			this.ui.renderLine(next)
			await new Promise((r) => setTimeout(r, 2000))
			if (this.killed) {
				return
			}
		}

		await this.command.execute('node ./node_modules/.bin/js-tetris-cli', {
			spawnOptions: {
				stdio: [process.stdin, 'pipe', 'pipe'],
			},
			onData: (data: string) => {
				if (!this.killed) {
					process.stdout?.write(data)
					if (this.statusMessage) {
						this.ui.saveCursor()
						this.ui.moveCursorTo(0, 25)
						this.ui.clearBelowCursor()
						process.stdout?.write(this.statusMessage)
						this.ui.restoreCursor()
					}
				}
			},
		})
	}

	public kill() {
		this.killed = true
		this.command.kill()
		this.ui.clear()
	}
}
