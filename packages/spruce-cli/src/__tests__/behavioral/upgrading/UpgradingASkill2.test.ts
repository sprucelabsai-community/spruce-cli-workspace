import fsUtil from 'fs'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import testUtil from '../../../tests/utilities/test.utility'
export default class UpgradingASkill2Test extends AbstractCliTest {
    protected static async beforeEach() {
        await super.beforeEach()
        this.commandFaker.fakeRebuild()
    }

    @test(
        'Upgrades error.plugin (even if skill is broken)',
        'error.plugin.ts',
        'errors'
    )
    @test(
        'Upgrades schema.plugin (even if skill is broken)',
        'schema.plugin.ts',
        'schemas'
    )
    @test(
        'Upgrades conversation.plugin (even if skill is broken)',
        'conversation.plugin.ts',
        'conversation',
        false
    )
    @test(
        'Upgrades view.plugin (even if skill is broken)',
        'view.plugin.ts',
        'views',
        true
    )
    protected static async upgradesPlugins(
        pluginName: string,
        cacheKey: string,
        shouldBlockYarn = true
    ) {
        await this.FeatureFixture().installCachedFeatures(cacheKey)

        shouldBlockYarn && this.commandFaker.fakeCommand(/yarn/, 0)

        const pluginPath = this.resolveHashSprucePath(`features/${pluginName}`)
        const originalContents = diskUtil.readFile(pluginPath)

        diskUtil.writeFile(pluginPath, 'aoeuaoeuao-euaoeu')

        const results = await this.Action('node', 'upgrade').execute({})

        assert.isFalsy(results.errors)

        testUtil.assertFileByNameInGeneratedFiles(pluginName, results.files)

        const updatedContents = diskUtil.readFile(pluginPath)

        assert.isEqual(updatedContents, originalContents)

        assert.doesInclude(results.summaryLines ?? [], 'successfully')
    }

    @test()
    protected static async canSkipPackageScriptChanges() {
        await this.FeatureFixture().installCachedFeatures('skills')

        const pkg = this.Service('pkg')
        pkg.set({ path: ['scripts', 'build.dev'], value: 'taco' })

        const promise = this.Action('node', 'upgrade').execute({})

        await this.waitForInput()

        const last = this.ui.getLastInvocation()

        assert.isEqual(last.command, 'prompt')
        assert.doesInclude(last.options.options.choices, { value: 'skip' })
        assert.doesInclude(last.options.options.choices, { value: 'skipAll' })
        assert.doesInclude(last.options.options.choices, { value: 'overwrite' })

        await this.ui.sendInput('skip')

        await promise

        assert.isEqual(pkg.get(['scripts', 'build.dev']), 'taco')
    }

    @test()
    protected static async asksForEachScriptChange() {
        await this.FeatureFixture().installCachedFeatures('skills')

        const pkg = this.Service('pkg')
        pkg.set({ path: ['scripts', 'build.dev'], value: 'taco' })
        pkg.set({ path: ['scripts', 'watch.build.dev'], value: 'taco' })

        const promise = this.Action('node', 'upgrade').execute({})

        await this.waitForInput()

        let last = this.ui.getLastInvocation()

        assert.isEqual(last.command, 'prompt')
        await this.ui.sendInput('skip')

        await this.waitForInput()

        last = this.ui.getLastInvocation()

        assert.isEqual(last.command, 'prompt')
        await this.ui.sendInput('skip')

        await promise

        assert.isEqual(pkg.get(['scripts', 'build.dev']), 'taco')
        assert.isEqual(pkg.get(['scripts', 'watch.build.dev']), 'taco')
    }

    @test()
    protected static async canSkipAllScriptChanges() {
        await this.FeatureFixture().installCachedFeatures('skills')

        const pkg = this.Service('pkg')
        pkg.set({ path: ['scripts', 'build.dev'], value: 'taco' })
        pkg.set({ path: ['scripts', 'watch.build.dev'], value: 'taco' })

        const promise = this.Action('node', 'upgrade').execute({})

        await this.waitForInput()

        let last = this.ui.getLastInvocation()

        assert.isEqual(last.command, 'prompt')
        await this.ui.sendInput('skipAll')

        await promise

        assert.isEqual(pkg.get(['scripts', 'build.dev']), 'taco')
        assert.isEqual(pkg.get(['scripts', 'watch.build.dev']), 'taco')
    }

    @test()
    protected static async canOverwriteChangedScript() {
        await this.FeatureFixture().installCachedFeatures('skills')

        const pkg = this.Service('pkg')
        pkg.set({ path: ['scripts', 'build.dev'], value: 'taco' })

        const promise = this.Action('node', 'upgrade').execute({})

        await this.waitForInput()

        let last = this.ui.getLastInvocation()

        assert.isEqual(last.command, 'prompt')
        await this.ui.sendInput('overwrite')

        await promise

        assert.isNotEqual(pkg.get(['scripts', 'build.dev']), 'taco')
    }

    @test()
    protected static async upgradingSkillWithSandboxUpgradesTheListener() {
        await this.FeatureFixture().installCachedFeatures('sandbox')
        const results = await this.Action('sandbox', 'setup').execute({})

        const match = testUtil.assertFileByNameInGeneratedFiles(
            /will-boot/,
            results.files
        )

        const originalContents = diskUtil.readFile(match)
        diskUtil.writeFile(match, 'broken')

        this.commandFaker.fakeCommand(/yarn/, 0)

        await this.Action('node', 'upgrade').execute({})

        const newContents = diskUtil.readFile(match)
        assert.isEqual(originalContents, newContents)
    }

    protected static assertSandboxListenerNotWritten() {
        const listeners = this.resolvePath('src', 'listeners')
        if (!diskUtil.doesDirExist(listeners)) {
            return
        }
        const matches = fsUtil.readdirSync(listeners)
        assert.isLength(
            matches,
            0,
            'A sandbox listeners was written and it should not have been.'
        )
    }
}
