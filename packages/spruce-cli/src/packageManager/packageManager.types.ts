import { CommandService } from '../services/CommandService'
import PkgService, { AddOptions } from '../services/PkgService'

export interface PackageManager {
    installDependencies(
        pkg?: string[] | string,
        options?: AddOptions
    ): Promise<{
        totalInstalled: number
        totalSkipped: number
    }>
    uninstallDependencies?(dependencies: string[] | string): Promise<void>
    isInstalled?(pkg: string): boolean
    deleteLockFile?(): void
}

export interface PackageManagerConstructorOptions {
    pkgService: PkgService
    commandService: CommandService
    cwd: string
}
