import {
	REMOTE_DEV,
	REMOTE_LOCAL,
	REMOTE_PROD,
	REMOTE_SANDBOX,
} from '@sprucelabs/spruce-event-utils'
import { test, assert } from '@sprucelabs/test'
import TerminalInterface from '../../interfaces/TerminalInterface'
import AbstractSkillTest from '../../tests/AbstractSkillTest'

export default class SettingRemoteTest extends AbstractSkillTest {
	protected static skillCacheKey = 'events'

	@test()
	protected static async hasSetRemoteAction() {
		assert.isFunction(this.Action('event', 'setRemote').execute)
	}

	@test(`saves local as ${REMOTE_LOCAL}`, `local`, `${REMOTE_LOCAL}`)
	@test(`saves dev as ${REMOTE_DEV}`, `developer`, `${REMOTE_DEV}`)
	@test(`saves sandbox as ${REMOTE_SANDBOX}`, `sandbox`, `${REMOTE_SANDBOX}`)
	@test(`saves prod as ${REMOTE_PROD}`, `production`, `${REMOTE_PROD}`)
	protected static async savesRemote(remote: string, expected: string) {
		await this.Action('event', 'setRemote').execute({ remote })

		const env = this.Service('env')
		const host = env.get('HOST')

		assert.isEqual(host, expected)
	}

	@test('create.event asks for remote on IS TTY', 'create')
	@test('sync.events asks for remote on IS TTY', 'sync')
	protected static async shouldAskForRemoteBeforeEventActionIsInvokedIfTerminalSupportsIt(
		action: string
	) {
		TerminalInterface.setDoesSupportColor(true)

		const env = this.Service('env')
		env.unset('HOST')

		void this.Action('event', action, {
			shouldAutoHandleDependencies: true,
		}).execute({})

		await this.waitForInput()

		const last = this.ui.lastInvocation()

		assert.doesInclude(last.options.label, 'remote')

		this.ui.reset()
	}

	@test('create.event throws for remote on NOT TTY', 'create', false)
	@test('sync.events throws for remote on NOT TTY', 'sync', false)
	protected static async shouldThrowBeforeEventActionIsInvokedIfTerminalSupportsIt(
		action: string
	) {
		TerminalInterface.setDoesSupportColor(false)
		const env = this.Service('env')
		env.unset('HOST')

		const results = await this.Action('event', action, {
			shouldThrowOnListenerError: false,
		}).execute({})

		assert.isTruthy(results.errors)
		assert.doesInclude(results.errors[0].stack, 'env.HOST')
	}

	@test()
	protected static async resultsOfCommandHasRemoteMixedIntoSummary() {
		this.Service('remote').set('developer')
		const results = await this.Action('event', 'sync').execute({})

		assert.isTruthy(results.summaryLines)
		assert.doesInclude(results.summaryLines, 'Remote: dev')
	}
}
