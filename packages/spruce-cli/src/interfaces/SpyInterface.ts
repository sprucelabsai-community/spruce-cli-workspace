import { FieldDefinitionValueType } from '@sprucelabs/schema'
import { testLog } from '@sprucelabs/spruce-skill-utils'
import { FieldDefinitions } from '#spruce/schemas/fields/fields.types'
import { ExecutionResults } from '../types/cli.types'
import { GraphicsInterface } from '../types/cli.types'
import {
	GraphicsTextEffect,
	ProgressBarOptions,
	ProgressBarUpdateOptions,
	ImageDimensions,
} from '../types/graphicsInterface.types'
import TerminalInterface from './TerminalInterface'

export default class SpyInterface implements GraphicsInterface {
	public invocations: { command: string; options?: any }[] = []
	public static shouldRenderAsTestLogs: any =
		process.env.SHOULD_RENDER_TEST_LOGS === 'true'

	private cursorPosition = { x: 0, y: 0 }

	private promptResolver?: (
		input: FieldDefinitionValueType<FieldDefinitions>
	) => void | undefined

	private confirmResolver?: (pass: boolean) => void | undefined
	private waitForEnterResolver?: () => void | undefined
	private promptDefaultValue: any
	private term?: TerminalInterface

	public constructor() {
		this.term = SpyInterface.shouldRenderAsTestLogs
			? new TerminalInterface(process.cwd(), true)
			: undefined
	}

	public renderWarning(
		message: string,
		effects?: GraphicsTextEffect[] | undefined
	): void {
		this.trackInvocation('renderWarning', { message, effects })
		this.term?.renderWarning(message)
	}

	public renderHint(
		message: string,
		effects?: GraphicsTextEffect[] | undefined
	): void {
		this.trackInvocation('renderHint', { message, effects })
		this.optionallyRenderLine(`Hint: ${message}`)
		this.term?.renderHint(message)
	}

	private trackInvocation(command: string, options?: any) {
		// testUtil.log(command, JSON.stringify(options), '\n')
		this.invocations.push({ command, options })
	}

	public isWaitingForInput() {
		return !!(
			this.promptResolver ||
			this.confirmResolver ||
			this.waitForEnterResolver
		)
	}

	public reset() {
		this.promptResolver = undefined
		this.confirmResolver = undefined
		this.waitForEnterResolver = undefined
	}

	public lastInvocation() {
		return this.invocations[this.invocations.length - 1]
	}

	public async sendInput(input: string): Promise<void> {
		this.trackInvocation('sendInput', input)

		this.optionallyRenderLine(
			`Sending input: "${input.length > 0 ? input : 'ENTER'}"`
		)

		if (this.waitForEnterResolver) {
			const resolver = this.waitForEnterResolver
			this.waitForEnterResolver = undefined

			resolver()
		} else if (this.promptResolver) {
			const resolver = this.promptResolver
			this.promptResolver = undefined

			resolver(input !== '\n' && input !== '' ? input : this.promptDefaultValue)
		} else if (this.confirmResolver) {
			const resolver = this.confirmResolver
			this.confirmResolver = undefined

			resolver(
				input === '\n' || input.length === 0 || input.toLowerCase() === 'y'
			)
		} else {
			throw new Error('Sent input before prompted for input')
		}

		return new Promise((resolve) => {
			setTimeout(resolve, 50)
		})
	}

	public renderSection(options: {
		headline: string
		lines?: string[] | string[]
		headlineEffects?: GraphicsTextEffect[]
		dividerEffects?: GraphicsTextEffect[]
		bodyEffects?: GraphicsTextEffect[]
		object?: any
	}): void {
		this.trackInvocation('renderSection', options)
		this.term?.renderSection(options)
	}

	public renderObject(obj: any): void {
		this.trackInvocation('renderObject', obj)
		this.term?.renderObject(obj)
	}

	public renderError(err: Error): void {
		this.trackInvocation('renderError', err)
		this.term?.renderError(err)
	}

	public renderCodeSample(code: string): void {
		this.trackInvocation('renderCodeSample', code)
		this.term?.renderCodeSample(code)
	}

	public renderCommandSummary(results: ExecutionResults): void {
		this.trackInvocation('renderCommandSummary', results)
		this.term?.renderCommandSummary(results)
	}

	public renderHero(
		message: string,
		effects?: GraphicsTextEffect[] | undefined
	): void {
		this.trackInvocation('renderHero', { message, effects })
		this.term?.renderHero(message, effects)
	}

	public renderHeadline(
		message: string,
		effects: GraphicsTextEffect[],
		dividerEffects: GraphicsTextEffect[]
	): void {
		this.trackInvocation('renderHeadline', { message, effects, dividerEffects })
		this.term?.renderHeadline(message, effects, dividerEffects)
	}

	public renderDivider(effects?: GraphicsTextEffect[] | undefined): void {
		this.trackInvocation('renderDivider', effects)
		this.term?.renderDivider(effects)
	}

	public renderLine(
		message: string,
		effects?: GraphicsTextEffect[] | undefined
	): void {
		this.trackInvocation('renderLine', { message, effects })
		message && message.length > 0 && this.optionallyRenderLine(message)
	}

	private optionallyRenderLine(message: string) {
		if (SpyInterface.shouldRenderAsTestLogs) {
			testLog.info(message)
		}
	}

	public async renderImage(
		path: string,
		options?: ImageDimensions
	): Promise<void> {
		this.trackInvocation('renderImage', { path, options })
	}

	public renderLines(
		messages: string[],
		effects?: GraphicsTextEffect[] | undefined
	): void {
		this.trackInvocation('renderLines', { messages, effects })
		this.term?.renderLines(messages, effects)
	}

	public async prompt<T extends FieldDefinitions>(definition: T) {
		this.trackInvocation('prompt', definition)

		if (this.promptResolver) {
			throw new Error(
				'Tried to double prompt. Try this.term?.sendInput() before calling prompt next.'
			)
		}

		this.optionallyRenderLine(`Prompt: ${definition.label}`)

		return new Promise<FieldDefinitionValueType<FieldDefinitions>>(
			(resolve) => {
				this.promptResolver = resolve
				this.promptDefaultValue = definition.defaultValue
			}
		)
	}

	public startLoading(message?: string | undefined): void {
		this.trackInvocation('startLoading', message)
		this.optionallyRenderLine(message ? `${message}` : 'Start loading...')
	}

	public stopLoading(): void {
		this.trackInvocation('stopLoading')
		this.optionallyRenderLine('Stop loading...')
	}

	public async waitForEnter(message?: string | undefined): Promise<void> {
		this.trackInvocation('waitForEnter', message)
		this.optionallyRenderLine(
			`${message ? ` ${message}\n\n` : ``}Waiting for enter...`
		)

		return new Promise((resolve) => {
			this.waitForEnterResolver = resolve
		})
	}

	public confirm(question: string): Promise<boolean> {
		this.trackInvocation('confirm', question)
		this.optionallyRenderLine(`${question} :: Y/N...`)

		return new Promise((resolve) => {
			this.confirmResolver = resolve
		})
	}

	public clear(): void {
		this.trackInvocation('clear')
	}

	public renderProgressBar(options: ProgressBarOptions): void {
		this.trackInvocation('renderProgressBar', options)
		this.optionallyRenderLine(
			`Showing progress${options.title ? ` ${options.title}` : ``}`
		)
	}

	public updateProgressBar(options: ProgressBarUpdateOptions): void {
		this.trackInvocation('updateProgressBar', options)
	}

	public removeProgressBar(): void {
		this.trackInvocation('removeProgressBar')
		this.optionallyRenderLine(`Hiding progress`)
	}

	public async getCursorPosition(): Promise<{ x: number; y: number } | null> {
		this.trackInvocation('getCursorPosition')
		return this.cursorPosition
	}

	public setCursorPosition(pos: { x: number; y: number }) {
		this.cursorPosition = pos
	}

	public moveCursorTo(x: number, y: number): void {
		this.trackInvocation('moveCursorTo', { x, y })
	}

	public clearBelowCursor(): void {
		this.trackInvocation('clearBelowCursor')
	}
}
