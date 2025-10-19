import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import {
    PackageManager,
    PackageManagerConstructorOptions,
} from '../packageManager/packageManager.types'
import { CommandService } from './CommandService'

export class GoPackageManager implements PackageManager {
    private commandService: CommandService
    public constructor(options: PackageManagerConstructorOptions) {
        const { commandService } = options
        this.commandService = commandService
    }

    public async installDependencies(pkg?: string[] | string) {
        const first = Array.isArray(pkg) ? pkg[0] : pkg
        if (first) {
            await this.commandService.execute('go', {
                args: ['get', first],
                env: this.buildEnv(),
            })
            return {
                totalInstalled: 1,
                totalSkipped: 0,
            }
        }

        return {
            totalInstalled: 0,
            totalSkipped: 0,
        }
    }

    private buildEnv() {
        const cwd = this.commandService.getCwd()
        const goCacheDir = diskUtil.resolvePath(cwd, '.go-cache')

        diskUtil.createDir(goCacheDir)

        return {
            HOME: process.env.HOME ?? cwd,
            GOCACHE: process.env.GOCACHE ?? goCacheDir,
        }
    }
}
