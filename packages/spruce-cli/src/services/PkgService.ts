import {
    diskUtil,
    PkgService as BasePkgService,
} from '@sprucelabs/spruce-skill-utils'
import NodePackageManager from '../packageManager/NodePackageManager'
import { PackageManager } from '../packageManager/packageManager.types'
import CommandServiceImpl from './CommandService'
import { GoPackageManager } from './GoPackageManager'

export default class PkgService extends BasePkgService {
    private packageManager: PackageManager

    public constructor(cwd: string, commandService: CommandServiceImpl) {
        super(cwd)
        const PackageManagerClass =
            diskUtil.detectProjectLanguage(cwd) === 'go'
                ? GoPackageManager
                : NodePackageManager

        this.packageManager = new PackageManagerClass({
            cwd,
            commandService,
            pkgService: this,
        })
    }

    public async install(pkg?: string[] | string, options?: AddOptions) {
        return this.packageManager.installDependencies(pkg, options)
    }

    public getSkillNamespace() {
        return this.get('skill.namespace') as string
    }

    public async uninstall(pkg: string[] | string) {
        return this.packageManager.uninstallDependencies?.(pkg)
    }
}

export interface AddOptions {
    isDev?: boolean
    shouldForceInstall?: boolean
    shouldCleanupLockFiles?: boolean
}
