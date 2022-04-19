import CommandService from '../services/CommandService'

type Command = RegExp | string

export default class CommandFaker {
	public fakeRebuild(code = 0) {
		const command = new RegExp(/yarn rebuild/gis)
		this.fakeCommand(command, code)
	}

	public fakeCommand(command: Command, code: number) {
		CommandService.fakeCommand(command, {
			code,
		})
	}

	public fakeCleanBuild(code = 0) {
		this.fakeCommand('yarn clean.build', code)
	}

	public fakeBuild(code = 0) {
		this.fakeCommand('yarn build.dev', code)
	}
}
