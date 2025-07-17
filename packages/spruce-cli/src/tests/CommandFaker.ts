import { assert } from '@sprucelabs/test-utils'
import CommandServiceImpl from '../services/CommandService'

type Command = RegExp | string

export default class CommandFaker {
    public fakeCommand(command: Command, code = 0) {
        CommandServiceImpl.fakeCommand(command, {
            code,
        })
    }

    public on(command: Command, cb: () => void) {
        CommandServiceImpl.fakeCommand(command, {
            code: 0,
            callback: cb,
        })
    }

    public makeCommandThrow(command: Command) {
        CommandServiceImpl.fakeCommand(command, {
            code: 1,
            callback: () =>
                assert.fail(`${command} should not have been called`),
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
        this.fakeCommand(/.*?(add|install)/gis, code)
    }
}
