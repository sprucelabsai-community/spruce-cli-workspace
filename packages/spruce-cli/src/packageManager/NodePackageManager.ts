import pathUtil from 'path'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { CommandService } from '../services/CommandService'
import PkgService, { AddOptions } from '../services/PkgService'
import isCi from '../utilities/isCi'
import {
    PackageManager,
    PackageManagerConstructorOptions,
} from './packageManager.types'

export default class NodePackageManager implements PackageManager {
    private pkgService: PkgService
    private cwd: string
    private commandService: CommandService

    public constructor(options: PackageManagerConstructorOptions) {
        const { pkgService, commandService, cwd } = options
        this.pkgService = pkgService
        this.commandService = commandService
        this.cwd = cwd
    }

    public async installDependencies(
        pkg?: string[] | string,
        options?: AddOptions
    ) {
        const shouldCleanupLockFiles = options?.shouldCleanupLockFiles !== false
        const deleteLockFile = shouldCleanupLockFiles
            ? () => this.pkgService.deleteLockFile()
            : () => {}

        if (!pkg) {
            await this.commandService.execute('yarn', { args: ['install'] })
            deleteLockFile()
            return { totalInstalled: -1, totalSkipped: -1 }
        }

        deleteLockFile()

        const packages = Array.isArray(pkg) ? pkg : [pkg]
        const toInstall = []
        const labsModules: string[] = []

        let totalInstalled = 0
        let totalSkipped = 0

        for (const thisPackage of packages) {
            const isInstalled =
                !options?.shouldForceInstall &&
                this.pkgService.isInstalled(thisPackage)
            if (thisPackage.startsWith('@sprucelabs/') || !isInstalled) {
                toInstall.push(this.pkgService.stripLatest(thisPackage))
                totalInstalled++
            } else {
                totalSkipped++
            }
        }

        if (totalInstalled > 0) {
            const { executable, args } = this.buildCommandAndArgs(
                toInstall,
                options
            )

            const isInWorkspace = this.pkgService.get('workspaces')?.length > 0
            if (isInWorkspace) {
                args.push('-W')
            }

            await this.commandService.execute(executable, {
                args,
            })
        } else if (
            !diskUtil.doesDirExist(pathUtil.join(this.cwd, 'node_modules'))
        ) {
            await this.commandService.execute('yarn', { args: ['install'] })
        }

        deleteLockFile()

        return {
            totalInstalled: totalInstalled + labsModules.length,
            totalSkipped,
        }
    }

    public async uninstallDependencies(pkg: string[] | string) {
        const packages = Array.isArray(pkg) ? pkg : [pkg]
        const args: string[] = ['uninstall', ...packages]
        await this.commandService.execute('npm', {
            args,
        })

        await this.installDependencies()
    }

    private buildCommandAndArgs(
        toInstall: string[],
        options: AddOptions | undefined
    ) {
        const args: any[] = [
            isCi() && '--cache-folder',
            isCi() && diskUtil.createRandomTempDir(),
            'add',
            ...toInstall,
        ].filter((a) => !!a)

        if (options?.isDev) {
            args.push('-D')
        }

        const executable = 'yarn'
        return { executable, args }
    }
}
