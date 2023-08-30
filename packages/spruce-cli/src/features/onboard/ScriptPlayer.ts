import { GraphicsInterface } from '../../types/cli.types'
import OnboardingStore from './stores/OnboardingStore'

export type Script = ScriptItem[]
type ScriptItem = string | ScriptItemCallback
type ScriptRedirect = string
interface ScriptItemCallback {
	(player: CallbackPlayer):
		| Promise<void | ScriptRedirect>
		| void
		| ScriptRedirect
}

export interface CallbackPlayer {
	ui: GraphicsInterface
	redirect(toScriptKey: string): ScriptRedirect
	onboardingStore: OnboardingStore
	executeCommand: CommandExecuter
}

export type CommandExecuter = (command: string) => Promise<void>

export default class ScriptPlayer {
	private ui: GraphicsInterface
	private scriptsByKey: Record<string, Script> = {}
	private onboardingStore: OnboardingStore

	private commandExecuter: CommandExecuter

	public constructor(options: {
		ui: GraphicsInterface
		onboardingStore: OnboardingStore
		commandExecuter: CommandExecuter
	}) {
		this.ui = options.ui
		this.onboardingStore = options.onboardingStore
		this.commandExecuter = options.commandExecuter
	}

	public async playScriptWithKey(key: string) {
		const script = this.scriptsByKey[key]

		if (!script) {
			throw new Error(`Onboarding script '${key}' not found.`)
		}

		await this.playScript(script)
	}

	public loadScript(key: string, script: Script) {
		this.scriptsByKey[key] = script
	}

	public async playScript(script: Script) {
		for (let item of script) {
			let possibleRedirect: ScriptRedirect | undefined
			switch (typeof item) {
				case 'string':
					if (this.isRedirect(item)) {
						possibleRedirect = item
					} else {
						this.ui.renderLine(item)
						this.ui.renderLine('')
					}
					break
				case 'function': {
					const r = await item(this.buildCallbackOptions())
					if (r) {
						possibleRedirect = r
					}
					break
				}
				default:
					possibleRedirect = item
			}

			if (this.isRedirect(possibleRedirect)) {
				await this.redirectAndPlay(possibleRedirect)
			}
		}
	}

	private buildCallbackOptions(): CallbackPlayer {
		return {
			ui: this.ui,
			redirect: ScriptPlayer.redirect,
			onboardingStore: this.onboardingStore,
			executeCommand: this.commandExecuter,
		}
	}

	private async redirectAndPlay(possibleRedirect: string) {
		const destination = this.extractDestination(possibleRedirect)
		if (destination) {
			await this.playScriptWithKey(destination)
		}
	}

	public static redirect(toScriptKey: string) {
		return `redirect->${toScriptKey}`
	}

	private extractDestination(possibleRedirect: string) {
		return possibleRedirect.split('->').pop()
	}

	private isRedirect(item: string | undefined): item is string {
		return !!(item && item.substr(0, 10) === 'redirect->')
	}
}
