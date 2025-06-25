import { eventDiskUtil } from '@sprucelabs/spruce-event-utils'
import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import SyncAction from '../../../features/error/actions/SyncAction'
import UpdateDependenciesAction from '../../../features/node/actions/UpdateDependenciesAction'
import CommandServiceImpl from '../../../services/CommandService'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import testUtil from '../../../tests/utilities/test.utility'
export default class UpgradingASkill3Test extends AbstractCliTest {
    private static originalErrorSyncExecute: any

    protected static async beforeEach() {
        if (!this.originalErrorSyncExecute) {
            this.originalErrorSyncExecute = SyncAction.prototype.execute
        } else {
            SyncAction.prototype.execute = this.originalErrorSyncExecute
        }

        await super.beforeEach()
        CommandServiceImpl.fakeCommand(new RegExp(/yarn rebuild/gis), {
            code: 0,
        })
    }

    @test()
    protected static async resolvePathAliasesToProductionAfterUpgrade() {
        CommandServiceImpl.clearFakedResponses()
        await this.FeatureFixture().installCachedFeatures('views')

        await this.Action('node', 'upgrade').execute({})

        const dependencies = this.Service('pkg').get('dependencies')

        assert.isFalsy(dependencies['@sprucelabs/resolve-path-aliases'])
    }

    @test()
    protected static async featuresNotEnabledDontInstall() {
        CommandServiceImpl.clearFakedResponses()
        await this.FeatureFixture().installCachedFeatures('schemas')

        const results = await this.Action('node', 'upgrade').execute({})

        const dependencies = this.Service('pkg').get('dependencies')

        assert.isFalsy(dependencies['@sprucelabs/heartwood-view-controllers'])

        assert.doesThrow(() =>
            testUtil.assertFileByNameInGeneratedFiles(
                'events.contract.ts',
                results.files
            )
        )

        this.assertViewPluginNotWritten()
    }

    @test()
    protected static async upgradingSkillSyncsEvents() {
        await this.FeatureFixture().installCachedFeatures('events')

        const results = await this.Action('node', 'upgrade').execute({})
        const events = eventDiskUtil.resolveCombinedEventsContractFile(this.cwd)

        assert.isTrue(diskUtil.doesFileExist(events))

        testUtil.assertFileByNameInGeneratedFiles(
            'events.contract.ts',
            results.files
        )
    }

    @test()
    protected static async upgradeCallsUpdateDependencies() {
        await this.FeatureFixture().installCachedFeatures('skills')

        UpdateDependenciesAction.prototype.execute = () => {
            throw new Error('baaaaad')
        }

        const results = await this.Action('node', 'upgrade').execute({})

        assert.isTruthy(results.errors)
        assert.doesInclude(results.errors[0].message, 'baaaaad')
    }

    @test()
    protected static async callsCleanFixAndBuildDev() {
        await this.FeatureFixture().installCachedFeatures('skills')

        let wasCleanBuildCalled = false
        UpdateDependenciesAction.prototype.execute = async () => {
            return {}
        }

        CommandServiceImpl.fakeCommand('yarn clean.build', {
            code: 0,
            callback: () => {
                wasCleanBuildCalled = true
            },
        })

        let wasBuildDevCalled = false

        CommandServiceImpl.fakeCommand('yarn build.dev', {
            code: 0,
            callback: () => {
                wasBuildDevCalled = true
            },
        })

        const results = await this.Action('node', 'upgrade').execute({})

        assert.isFalsy(results.errors)
        assert.isTrue(wasCleanBuildCalled)
        assert.isTrue(wasBuildDevCalled)
    }

    @test()
    protected static async writesViewPlugin() {
        await this.FeatureFixture().installCachedFeatures('views')

        const plugin = this.getViewsPluginPath()
        assert.isTrue(diskUtil.doesFileExist(plugin))

        diskUtil.deleteFile(plugin)

        assert.isFalse(diskUtil.doesFileExist(plugin))

        await this.Action('node', 'upgrade').execute({})

        assert.isTrue(diskUtil.doesFileExist(plugin))
    }

    @test('sync with errors installed')
    @test('sync with errors not installed', false)
    protected static async upgradeSyncsErrors(isInstalled = true) {
        await this.FeatureFixture().installCachedFeatures(
            isInstalled ? 'errors' : 'schemas'
        )

        let wasHit = false

        SyncAction.prototype.execute = async () => {
            wasHit = true
            return {}
        }

        this.disableCleanBuildAndYarnAdd()

        await this.Action('node', 'upgrade').execute({})

        assert.isEqual(wasHit, isInstalled)
    }

    @test()
    protected static async resetsErrorPluginInSkill() {
        await this.FeatureFixture().installCachedFeatures('skills')

        const { plugin, expectedContents } = this.destroyErrorPlugin()

        await this.disableCleanBuildAndYarnAdd()

        const promise = this.Action('node', 'upgrade').execute({
            upgradeMode: 'askForChanged',
        })

        await this.waitForInput()
        await this.ui.sendInput('overwrite')

        await promise

        const actualContents = diskUtil.readFile(plugin)

        assert.isEqual(actualContents, expectedContents)
    }

    @test()
    protected static async resetsErrorPluginWhenErrorInstalled() {
        await this.FeatureFixture().installCachedFeatures('errors')

        await this.Action('error', 'create').execute({
            nameReadable: 'Test pass',
            nameCamel: 'testPass',
        })

        const { plugin, expectedContents } = this.destroyErrorPlugin()

        this.disableCleanAndBuild()

        const results = await this.Action('node', 'upgrade').execute({
            upgradeMode: 'askForChanged',
        })

        assert.isFalsy(results.errors)
        const actualContents = diskUtil.readFile(plugin)

        assert.isEqual(actualContents, expectedContents)
    }

    private static destroyErrorPlugin() {
        const plugin = this.resolveHashSprucePath('errors', 'options.types.ts')
        const expectedContents = diskUtil.readFile(plugin)

        diskUtil.writeFile(plugin, 'waka')
        return { plugin, expectedContents }
    }

    private static getViewsPluginPath() {
        return this.resolveHashSprucePath('features', 'view.plugin.ts')
    }

    protected static assertViewPluginNotWritten() {
        assert.isFalse(diskUtil.doesFileExist(this.getViewsPluginPath()))
    }

    private static disableCleanBuildAndYarnAdd() {
        this.disableCleanAndBuild()

        CommandServiceImpl.fakeCommand(/yarn.*?add/gis, {
            code: 0,
        })
    }

    private static disableCleanAndBuild() {
        CommandServiceImpl.fakeCommand('yarn clean.build', {
            code: 0,
        })

        CommandServiceImpl.fakeCommand('yarn build.dev', {
            code: 0,
        })
    }
}
