import pathUtil from 'path'
import {
    diskUtil,
    PkgService as BasePkgService,
} from '@sprucelabs/spruce-skill-utils'
import isCi from '../utilities/isCi'
import CommandServiceImpl from './CommandService'

export default class PkgService extends BasePkgService {
    private commandService: CommandServiceImpl

    public constructor(cwd: string, commandService: CommandServiceImpl) {
        super(cwd)
        this.commandService = commandService
    }

    public async install(pkg?: string[] | string, options?: AddOptions) {
        const shouldCleanupLockFiles = options?.shouldCleanupLockFiles !== false
        const deleteLockFile = shouldCleanupLockFiles
            ? this.deleteLockFile.bind(this)
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
                !options?.shouldForceInstall && this.isInstalled(thisPackage)
            if (thisPackage.startsWith('@sprucelabs/') || !isInstalled) {
                toInstall.push(this.stripLatest(thisPackage))
                totalInstalled++
            } else {
                totalSkipped++
            }
        }

        if (totalInstalled > 0) {
            const { executable, args } = PkgService.buildCommandAndArgs(
                toInstall,
                options
            )

            const isInWorkspace = this.get('workspaces')?.length > 0
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

        this._parsedPkg = undefined

        return {
            totalInstalled: totalInstalled + labsModules.length,
            totalSkipped,
        }
    }

    public static buildCommandAndArgs(
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

    public getSkillNamespace() {
        return this.get('skill.namespace') as string
    }

    public async uninstall(pkg: string[] | string) {
        const packages = Array.isArray(pkg) ? pkg : [pkg]
        const args: string[] = ['uninstall', ...packages]
        await this.commandService.execute('npm', {
            args,
        })

        this._parsedPkg = undefined

        await this.install()
    }
}

export interface AddOptions {
    isDev?: boolean
    shouldForceInstall?: boolean
    shouldCleanupLockFiles?: boolean
}
