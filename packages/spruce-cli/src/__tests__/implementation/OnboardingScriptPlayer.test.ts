import { test, assert } from '@sprucelabs/test-utils'
import ScriptPlayer from '../../features/onboard/ScriptPlayer'
import AbstractCliTest from '../../tests/AbstractCliTest'

export default class OnboardingScriptPlayerTest extends AbstractCliTest {
	private static player: ScriptPlayer
	private static commandExecuterCommands: string[] = []

	protected static async beforeEach() {
		await super.beforeEach()

		const store = this.Store('onboarding')

		this.commandExecuterCommands = []
		this.player = new ScriptPlayer({
			ui: this.ui,
			onboardingStore: store,
			commandExecuter: async (command: string) => {
				this.commandExecuterCommands.push(command)
			},
		})
	}

	@test()
	protected static canCreateScriptPlayer() {
		assert.isTruthy(this.player)
	}

	@test()
	protected static async canPlayTextScript() {
		await this.player.playScript(['Hey there!'])
		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'Hey there!' },
		})
	}

	@test()
	protected static async canPlayCallback() {
		await this.player.playScript([
			(player) => {
				player.ui.renderLine('hello world')
			},
		])

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'hello world' },
		})
	}

	@test()
	protected static async canPlayAsyncCallback() {
		await this.player.playScript([
			async (player) => {
				player.ui.renderLine('hello async world')
			},
		])

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'hello async world' },
		})
	}

	@test()
	protected static async throwsWithBadScriptKey() {
		await assert.doesThrowAsync(() =>
			this.player.playScriptWithKey('not-found')
		)
	}

	@test()
	protected static async canLoadScriptsByKey() {
		this.player.loadScript('first', ['hey there', 'how are you'])
		this.player.loadScript('second', ['hey there 2', 'how are you 2'])

		await this.player.playScriptWithKey('first')

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'hey there' },
		})

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'how are you' },
		})

		await this.player.playScriptWithKey('second')

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'hey there 2' },
		})

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'how are you 2' },
		})
	}

	@test()
	protected static async onScriptCanRedirectToAnother() {
		this.player.loadScript('first', [
			'hey there',
			'how are you',
			ScriptPlayer.redirect('second'),
		])

		this.player.loadScript('second', [
			'hey there 2',
			'how are you 2',
			(player) => player.redirect('third'),
		])

		this.player.loadScript('third', ['hey there 3', 'how are you 3'])

		await this.player.playScriptWithKey('first')

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'hey there 2' },
		})

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'how are you 2' },
		})

		assert.doesInclude(this.ui.invocations, {
			command: 'renderLine',
			options: { message: 'how are you 3' },
		})
	}

	@test()
	protected static async scriptsCanAccessOnboardingStore() {
		await this.player.playScript([
			async (player) => {
				const mode = player.onboardingStore.getMode()
				assert.isEqual(mode, 'off')
			},
		])
	}

	@test()
	protected static async canInvokeCommand() {
		await this.player.playScript([
			async (player) => {
				await player.executeCommand('test.command')
			},
		])

		assert.isLength(this.commandExecuterCommands, 1)
		assert.isEqual(this.commandExecuterCommands[0], 'test.command')
	}
}
