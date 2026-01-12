import fsUtil from 'fs'
import pathUtil from 'path'
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
        const filtered = this.filterOutWorkspaceSiblings(pkg)
        if (Array.isArray(filtered) && filtered.length === 0) {
            return { totalInstalled: 0 }
        }
        return this.packageManager.installDependencies(filtered, options)
    }

    private filterOutWorkspaceSiblings(
        pkg?: string[] | string
    ): string[] | string | undefined {
        if (!pkg) {
            return pkg
        }
        const siblings = this.getWorkspaceSiblingNames()
        const packages = Array.isArray(pkg) ? pkg : [pkg]
        const filtered = packages.filter((p) => !siblings.includes(p))
        return Array.isArray(pkg) ? filtered : filtered[0]
    }

    private getWorkspaceSiblingNames(): string[] {
        const packagesDir = pathUtil.dirname(this.cwd)
        if (pathUtil.basename(packagesDir) !== 'packages') {
            return []
        }

        const monorepoRoot = pathUtil.dirname(packagesDir)
        const rootPkgPath = pathUtil.join(monorepoRoot, 'package.json')
        if (!diskUtil.doesFileExist(rootPkgPath)) {
            return []
        }

        const siblingDirs = fsUtil.readdirSync(packagesDir)
        const names: string[] = []

        for (const dir of siblingDirs) {
            const pkgPath = pathUtil.join(packagesDir, dir, 'package.json')
            if (diskUtil.doesFileExist(pkgPath)) {
                const siblingPkg = JSON.parse(diskUtil.readFile(pkgPath))
                if (siblingPkg.name) {
                    names.push(siblingPkg.name)
                }
            }
        }

        return names
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
