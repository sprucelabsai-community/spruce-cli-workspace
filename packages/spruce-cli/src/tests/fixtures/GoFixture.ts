import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { generateId } from '@sprucelabs/test-utils'
import { CommandService } from '../../services/CommandService'

export default class GoFixture {
    private cmdService: CommandService
    public constructor(cmdService: CommandService) {
        this.cmdService = cmdService
    }

    public async initGoProject(name?: string) {
        await this.cmdService.execute(
            `go mod init github.com/${generateId()}/${name ?? generateId()}`,
            {
                env: this.buildEnv(),
            }
        )
    }

    public setCwd(dir: string) {
        this.cmdService.setCwd(dir)
    }

    public async exec(command: string, arg1: string) {
        return this.cmdService.execute(`go`, {
            args: [command, arg1],
            env: this.buildEnv(),
        })
    }

    private buildEnv() {
        const cwd = this.cmdService.getCwd()
        const goCacheDir = diskUtil.resolvePath(cwd, '.go-cache')

        diskUtil.createDir(goCacheDir)

        return {
            HOME: process.env.HOME ?? cwd,
            GOCACHE: goCacheDir,
        }
    }
}
