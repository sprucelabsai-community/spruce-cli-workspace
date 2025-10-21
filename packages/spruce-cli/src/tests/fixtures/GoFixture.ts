import os from 'os'
import { generateId } from '@sprucelabs/test-utils'
import { CommandService } from '../../services/CommandService'

export default class GoFixture {
    private cmdService: CommandService
    public constructor(cmdService: CommandService) {
        this.cmdService = cmdService
    }

    public async initGoProject(name?: string) {
        const moduleName = `github.com/${generateId()}/${name ?? generateId()}`
        await this.cmdService.execute(`go mod init ${moduleName}`, {
            env: this.buildEnv(),
        })
        return moduleName
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
        return {
            HOME: os.homedir(),
        }
    }

    public async vet() {
        await this.exec('vet', './...')
    }
}
