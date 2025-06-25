import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import CommandServiceImpl from '../../../services/CommandService'
import PkgService from '../../../services/PkgService'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import uiAssert from '../../../tests/utilities/uiAssert.utility'

export default class UpgradingANodeModuleTest extends AbstractCliTest {
    private static pkg: PkgService
    protected static async beforeEach() {
        await super.beforeEach()

        await this.FeatureFixture().installCachedFeatures('everythingInNode')
        this.pkg = this.Service('pkg')
        const featureInstaller = this.featureInstaller
        featureInstaller.markAsPermanentlySkipped('skill')
    }

    @test()
    protected static async buildErrorsGetPassedThroughToResults() {
        CommandServiceImpl.fakeCommand(/yarn (add|install)/gis, { code: 0 })
        CommandServiceImpl.fakeCommand(/yarn clean.build/gis, { code: 1 })
        CommandServiceImpl.fakeCommand(/yarn build.dev/gis, { code: 0 })

        await this.emitter.on('feature.did-execute', () => {
            return {
                errors: undefined,
            }
        })

        const results = await this.Action('node', 'upgrade').execute({})

        assert.isTruthy(results.errors)
    }

    @test()
    protected static async upgradingWritesExpectedFiles() {
        CommandServiceImpl.fakeCommand(/build/gis, { code: 0 })

        const shouldNotBeFound = [
            'src/.spruce/skill.ts',
            'src/.spruce/features',
        ]
        diskUtil.deleteDir(this.resolveHashSprucePath('features'))

        const results = await this.upgrade()

        assert.isFalsy(results.errors)

        for (const search of shouldNotBeFound) {
            const doesExist = diskUtil.doesFileExist(this.resolvePath(search))
            assert.isFalse(doesExist, `Should not have found ${search}`)
        }
    }

    @test()
    protected static async shouldReWriteNodeDirsAndSkipIndex() {
        for (const file of ['tsconfig.json', 'src/index.ts']) {
            const tsConfig = this.resolvePath(file)
            diskUtil.writeFile(tsConfig, 'beenChanged')
        }

        this.fakeYarn()

        const promise = this.upgrade()

        await uiAssert.assertRendersConfirmWriteFile(this.ui)

        assert.isEqual(
            diskUtil.readFile(this.resolvePath('src/index.ts')),
            'beenChanged'
        )

        await promise
    }

    @test()
    protected static async resolvePathAliasesIsADevDependencyInNodeModules() {
        this.assertResolvePathAliasesIsDevDependency()
        await this.upgrade()
        this.assertResolvePathAliasesIsDevDependency()
    }

    @test()
    protected static async movesResolvePathAliasesToDevDependencyOnUpgrade() {
        const version = this.pkg.get([
            'devDependencies',
            '@sprucelabs/resolve-path-aliases',
        ])

        this.pkg.unset(['devDependencies', '@sprucelabs/resolve-path-aliases'])

        this.pkg.set({
            path: ['dependencies', '@sprucelabs/resolve-path-aliases'],
            value: version,
        })

        await this.upgrade()
        this.assertResolvePathAliasesIsDevDependency()
    }

    @test()
    protected static async removesBuildFromScriptsIfMatchesBrokenBuild() {
        this.pkg.set({
            path: ['scripts', 'build'],
            value: 'yarn run build.tsc --sourceMap ; yarn run resolve-paths',
        })

        this.fakeYarn()
        await this.upgrade()

        const build = this.pkg.get(['scripts', 'build'])
        assert.isFalsy(
            build,
            'Should not have build script since it matches broken build'
        )
    }

    @test()
    protected static async doesNotRemoveBuildFromScriptsIfDoesNotMatchBrokenBuild() {
        const value = 'yarn run build.tsc --sourceMap'
        this.pkg.set({
            path: ['scripts', 'build'],
            value,
        })
        this.fakeYarn()
        await this.upgrade()
        const build = this.pkg.get(['scripts', 'build'])
        assert.isEqual(
            build,
            value,
            'Should have build script since it does not match broken build'
        )
    }

    private static fakeYarn() {
        CommandServiceImpl.fakeCommand(/yarn/gi, {
            code: 0,
        })
    }

    private static assertResolvePathAliasesIsDevDependency() {
        const devVersion = this.pkg.get([
            'devDependencies',
            '@sprucelabs/resolve-path-aliases',
        ])

        assert.isTruthy(
            devVersion,
            'Should have resolve path aliases as a dev dependency'
        )

        const prodVersion = this.pkg.get([
            'dependencies',
            '@sprucelabs/resolve-path-aliases',
        ])
        assert.isFalsy(
            prodVersion,
            'Should not have resolve path aliases as a prod dependency'
        )
    }

    private static async upgrade() {
        return await this.Action('node', 'upgrade').execute({})
    }
}
