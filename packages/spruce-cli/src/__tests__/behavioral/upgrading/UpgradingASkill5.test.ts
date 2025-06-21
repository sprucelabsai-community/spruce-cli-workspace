import { Schema } from '@sprucelabs/schema'
import { test, assert } from '@sprucelabs/test-utils'
import ActionFactory from '../../../features/ActionFactory'
import { FeatureAction } from '../../../features/features.types'
import CommandServiceImpl from '../../../services/CommandService'
import LintService from '../../../services/LintService'
import ServiceFactory from '../../../services/ServiceFactory'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class UpgradingASkill5Test extends AbstractCliTest {
    public static invocationLog: string[] = []

    protected static async beforeEach() {
        await super.beforeEach()
        this.invocationLog = []
    }

    @test()
    protected static async upgradeResetsEventCache() {
        await this.installSetListenerCacheAndBlockExecute()

        await assert.doesThrowAsync(() => this.upgrade())

        const value = this.Settings().getListenerCache()
        assert.isFalsy(value)
    }

    @test()
    protected static async doesNotResetEventCacheWithOtherAction() {
        await this.installSetListenerCacheAndBlockExecute()

        await assert.doesThrowAsync(() =>
            this.Action('schema', 'sync').execute({})
        )

        const value = this.Settings().getListenerCache()
        assert.isEqualDeep(value, { shouldBeDeleted: true })
    }

    @test(
        'syncs schemas when schemas installed and schemas folder exists',
        true
    )
    @test(
        'does not syncs schemas when schemas installed but schemas folder does not exist',
        false
    )
    protected static async shouldSyncSchemasIfSchemasIsInstalledAndSchemaFolderExists(
        shouldCreateSchema: boolean
    ) {
        await this.FeatureFixture().installCachedFeatures('schemas')

        CommandServiceImpl.fakeCommand(new RegExp(/yarn/gis), {
            code: 0,
        })

        if (shouldCreateSchema) {
            await this.Action('schema', 'create').execute({
                nameReadable: 'Test schema!',
                namePascal: 'AnotherTest',
                nameCamel: 'anotherTest',
                description: 'this is so great!',
            })
        }

        const emitter = this.emitter

        let wasHit = false

        await emitter.on('feature.will-execute', (payload) => {
            if (
                payload.featureCode === 'schema' &&
                payload.actionCode === 'sync'
            ) {
                wasHit = true
            }

            return {}
        })

        await this.upgrade()

        assert.isTrue(wasHit === shouldCreateSchema)
    }

    @test()
    protected static async modulesMovedFromDevToProdDependenciesStayThere() {
        await this.installSkillsSkill()

        await this.moveDependencyToProd('eslint')
        await this.moveDependencyToDev('@sprucelabs/error')

        let wasMovedBackToDev = false
        let wasMovedBackToProd = false

        CommandServiceImpl.fakeCommand(new RegExp(/yarn/gis), {
            code: 0,
            callback: (_, args) => {
                if (args.indexOf('-D') > -1 && args.indexOf('eslint') > -1) {
                    wasMovedBackToDev = true
                } else if (
                    args.indexOf('-D') === -1 &&
                    args.indexOf('@sprucelabs/error') > -1
                ) {
                    wasMovedBackToProd = true
                }
            },
        })

        await this.upgrade()

        assert.isFalse(wasMovedBackToDev, 'dependency moved back to dev')
        assert.isFalse(wasMovedBackToProd, 'dependency moved back to prod')
    }

    @test()
    protected static async resolvePathsMovedToProdDependencies() {
        await this.installSkillsSkill()
        await this.moveDependencyToDev('@sprucelabs/resolve-path-aliases')
        await this.upgrade()
        const pkg = this.Service('pkg')
        const pkgContents = pkg.readPackage()
        assert.isTruthy(
            pkgContents.dependencies['@sprucelabs/resolve-path-aliases'],
            'resolve-path-aliases should be in dependencies'
        )
        assert.isFalsy(
            pkgContents.devDependencies['@sprucelabs/resolve-path-aliases'],
            'resolve-path-aliases should not be in devDependencies'
        )
    }

    @test()
    protected static async runsFixLintAfterUpgrade() {
        ActionFactory.setActionClass(
            'node',
            'updateDependencies',
            SpyUpdateDependenciesAction
        )

        ServiceFactory.setFactoryClass('lint', SpyLintService)

        CommandServiceImpl.fakeCommand(/.*/gi, {
            code: 0,
            callback: (command, args) => {
                this.invocationLog.push([command, ...args].join(' '))
            },
        })

        await this.installSkillsSkill()
        await this.upgrade()

        const lastIdx = this.invocationLog.length - 1
        const secondToLastIdx = lastIdx - 1

        assert.isEqual(this.invocationLog[lastIdx], 'yarn build.dev')
        assert.isEqual(
            this.invocationLog[secondToLastIdx],
            'yarn fix.lint **/*.ts'
        )
    }

    private static async upgrade() {
        await this.Action('node', 'upgrade').execute({})
    }

    private static async installSkillsSkill() {
        await this.FeatureFixture().installCachedFeatures('skills')
    }

    private static async moveDependencyToDev(name: string) {
        const pkg = this.Service('pkg')
        await pkg.uninstall(name)
        await pkg.install(name, { isDev: true })
    }
    private static async moveDependencyToProd(name: string) {
        const pkg = this.Service('pkg')

        await pkg.uninstall(name)
        await pkg.install(name)
    }

    private static async installSetListenerCacheAndBlockExecute() {
        await this.FeatureFixture().installCachedFeatures('events')

        const settings = this.Settings()
        settings.setListenerCache({ shouldBeDeleted: true })

        const emitter = this.emitter
        void emitter.on('feature.will-execute', () => {
            throw new Error('Stop!')
        })
    }

    private static Settings() {
        return this.Service('eventCache')
    }
}

class SpyUpdateDependenciesAction implements FeatureAction {
    public optionsSchema?: Schema | undefined
    public commandAliases: string[] = []
    public invocationMessage = 'Nothing'
    public async execute() {
        UpgradingASkill5Test.invocationLog.push('updateDependencies')
        return {}
    }
}

class SpyLintService extends LintService {
    public static fixPattern: string
    public fix = async (pattern: string): Promise<string[]> => {
        SpyLintService.fixPattern = pattern
        UpgradingASkill5Test.invocationLog.push('yarn fix.lint ' + pattern)
        return []
    }
}
