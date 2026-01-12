import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import CommandServiceImpl from '../../../services/CommandService'
import PkgService from '../../../services/PkgService'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingAMonorepoTest extends AbstractCliTest {
    private static monorepoDir: string
    private static packageADir: string
    private static packageBDir: string
    private static wackyPackageName: string
    private static pkg: PkgService
    private static monoRepoPkg: PkgService
    private static passedYarnArgs: string[] = []
    private static yarnHitCount = 0

    protected static async beforeAll() {
        await super.beforeAll()
        await this.setupMonorepo()
    }

    protected static async beforeEach() {
        await super.beforeEach()

        this.passedYarnArgs = []
        this.yarnHitCount = 0

        this.cwd = this.monorepoDir
        this.monoRepoPkg = this.Service('pkg', this.monorepoDir)
    }

    @test()
    protected static async canUpgradePackageAInMonorepo() {
        this.setCwd(this.packageADir)
        this.fakeYarnCommands()
        await this.assertUpgradePasses()
    }

    @test()
    protected static async canUpgradePackageBWithCrossDependency() {
        this.setCwd(this.packageBDir)

        this.fakeYarnCommands()

        await this.assertUpgradePasses()

        assert.isEqual(
            this.yarnHitCount,
            3,
            'Should not try and install if only module is ignored'
        )

        this.assertDidNotUpgradePackageA()
    }

    @test()
    protected static async canUpgradeWithRandomlyNamedSiblingPackage() {
        this.wackyPackageName = `package-${Math.random()}`
        this.createMinimalPackage(this.wackyPackageName)

        this.addDependency(this.packageADir, this.wackyPackageName, '^1.0.0')
        this.addDependency(this.packageBDir, this.wackyPackageName, '^1.0.0')

        this.setCwd(this.packageADir)
        this.fakeYarnCommands()

        await this.assertUpgradePasses()

        this.assertPackageSkipped(this.wackyPackageName)
    }

    private static assertDidNotUpgradePackageA() {
        this.assertPackageSkipped('package-a')
    }

    private static assertPackageSkipped(packageName: string) {
        assert.doesNotInclude(
            this.passedYarnArgs,
            packageName,
            `Should not try to upgrade ${packageName}`
        )
    }

    private static fakeYarnCommands() {
        CommandServiceImpl.fakeCommand(/yarn*/, {
            code: 0,
            callback: (_, args) => {
                this.passedYarnArgs.push(...args)
                this.yarnHitCount++
            },
        })
    }

    private static async assertUpgradePasses() {
        const results = await this.Action('node', 'upgrade').execute({})
        assert.isFalsy(results.errors, 'Should not have errors')
    }

    private static async setupMonorepo() {
        this.monorepoDir = this.freshTmpDir()
        this.setCwd(this.monorepoDir)

        this.createRootPackageJson()

        this.packageADir = await this.createModule('package-a')
        this.packageBDir = await this.createModule('package-b')

        this.addDependency(this.packageBDir, 'package-a', '^1.0.0')
    }

    private static createRootPackageJson() {
        this.setCwd(this.monorepoDir)
        const pkgPath = this.resolvePath('package.json')
        diskUtil.writeFile(pkgPath, '{}')

        this.monoRepoPkg = this.Service('pkg')
        this.monoRepoPkg.set({ path: ['name'], value: 'test-monorepo' })
        //@ts-ignore REMOVE WHEN YOU FIND THIS, TYPES UPDATED
        this.monoRepoPkg.set({ path: ['private'], value: true })
        this.monoRepoPkg.set({ path: ['workspaces'], value: ['packages/*'] })
    }

    private static async createModule(name: string) {
        const packageDir = this.resolvePackageDir(name)
        diskUtil.createDir(packageDir)
        this.setCwd(packageDir)

        await this.Action('node', 'create', {
            shouldAutoHandleDependencies: true,
        }).execute({
            name,
            description: `Test module ${name}`,
        })

        return packageDir
    }

    private static resolvePackageDir(name: string) {
        return diskUtil.resolvePath(this.monorepoDir, 'packages', name)
    }

    private static addDependency(
        packageDir: string,
        depName: string,
        version: string
    ) {
        this.pkg = this.Service('pkg', packageDir)
        this.pkg.set({
            path: ['dependencies', depName],
            value: version,
        })
    }

    private static createMinimalPackage(name: string) {
        const packageDir = this.resolvePackageDir(name)
        diskUtil.createDir(packageDir)

        const pkgPath = diskUtil.resolvePath(packageDir, 'package.json')
        diskUtil.writeFile(
            pkgPath,
            JSON.stringify({ name, version: '1.0.0' }, null, 2)
        )

        return packageDir
    }
}
