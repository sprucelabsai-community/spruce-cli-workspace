import { assert } from '@sprucelabs/test-utils'
import CommandService from '../services/CommandService'

type Command = RegExp | string

export default class CommandFaker {
	public fakeCommand(command: Command, code = 0) {
		CommandService.fakeCommand(command, {
			code,
		})
	}

	public makeCommandThrow(command: Command) {
		CommandService.fakeCommand(command, {
			code: 1,
			callback: () => assert.fail(`${command} should not have been called`),
		})
	}

	public fakeRebuild(code = 0) {
		const command = new RegExp(/yarn rebuild/gis)
		this.fakeCommand(command, code)
	}

	public fakeCleanBuild(code = 0) {
		this.fakeCommand('yarn clean.build', code)
	}

	public fakeBuild(code = 0) {
		this.fakeCommand('yarn build.dev', code)
	}

	public fakeInstall(code = 0) {
		this.fakeCommand(/.*?install/gis, code)
	}
}
