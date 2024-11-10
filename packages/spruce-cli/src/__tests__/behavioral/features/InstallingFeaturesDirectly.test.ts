import { SelectChoice } from '@sprucelabs/spruce-core-schemas'
import { test, assert, generateId } from '@sprucelabs/test-utils'
import { InstallFeatureOptions } from '../../../features/features.types'
import InstallFeatureAction, {
    InstallFeatureActionOptions,
} from '../../../features/skill/actions/InstallFeatureAction'
import AbstractSkillTest from '../../../tests/AbstractSkillTest'

export default class InstallingFeaturesDirectlyTest extends AbstractSkillTest {
    private static action: InstallFeatureAction
    protected static skillCacheKey = 'skills'

    protected static async beforeEach() {
        await super.beforeEach()
        this.action = this.Action('skill', 'installFeature')
    }

    protected static async afterEach() {
        this.ui.reset()
        await super.afterEach()
    }

    @test()
    protected static async hasExpectedAliases() {
        assert.isEqualDeep(this.action.commandAliases, ['install.feature'])
    }

    @test()
    protected static async promptsForWhichFeatureToInstall() {
        await this.executeAndWaitForPrompt()

        const features = {
            error: 'Errors',
            event: 'Events',
            schema: 'Schemas',
            store: 'Stores (including database support)',
            test: 'Tests',
            view: 'Views',
        }

        const choices: SelectChoice[] = Object.keys(features).map((key) => ({
            label: features[key as keyof typeof features],
            value: key,
        }))

        const last = this.ui.getLastInvocation()
        assert.isEqual(last.command, 'prompt')
        assert.isEqualDeep(last.options, {
            type: 'select',
            label: 'Which feature do you want to install?',
            isRequired: true,
            options: {
                choices,
            },
        })
    }

    @test('can install store feature', 'store')
    @test('can install view feature', 'view')
    @test('can install test feature', 'test')
    protected static async selectingAFeatureTriesToInstallIt(featureCode: any) {
        let passedOption: InstallFeatureOptions | undefined

        this.featureInstaller.install = async (options) => {
            passedOption = options
            return {}
        }
        await this.executeAndWaitForPrompt()
        await this.sendInput(featureCode)

        assert.isEqualDeep(passedOption, { features: [{ code: featureCode }] })
    }

    @test()
    protected static async returnsResultsFromFeatureInstall() {
        const results = {
            [generateId()]: generateId(),
            [generateId()]: generateId(),
        }

        this.featureInstaller.install = async () => results

        const { promise } = await this.executeAndWaitForPrompt()

        await this.sendInput('store')

        const actual = await promise

        assert.isEqualDeep(actual, results)
    }

    @test('skips view feature if already installed', 'view')
    @test('skips store feature if already installed', 'store')
    @test('skips test feature if already installed', 'test')
    protected static async doesNotShowOptionForInstalledFeature(code: string) {
        this.featureInstaller.install = async () => ({})
        const installed = ['skill', code]
        this.featureInstaller.isInstalled = async (code) =>
            installed.includes(code)
        await this.executeAndWaitForPrompt()
        const { options } = this.ui.getLastInvocation()
        const choices = options.options.choices as SelectChoice[]
        assert.doesNotInclude(
            choices.map((c) => c.value),
            code
        )
    }

    @test()
    protected static async ifThereAreNoFeaturesToInstallDonNotPrompt() {
        this.featureInstaller.isInstalled = async () => true
        const results = await this.execute()
        assert.isEqualDeep(results, {
            summaryLines: [
                'Nothing to install, you have already installed everything!',
            ],
        })
    }

    @test('should install directly view', 'view')
    @test('should install directly store', 'store')
    @test('should install directly test', 'test')
    protected static async passingFeatureCodeToActionSkipsPrompt(code: any) {
        let passedOption: InstallFeatureOptions | undefined
        this.featureInstaller.install = async (options) => {
            passedOption = options
            return {}
        }

        this.ui.prompt = async () => assert.fail('Should not prompt')

        await this.execute({ code })
        assert.isEqualDeep(passedOption, { features: [{ code }] })
    }

    private static async sendInput(featureCode: string) {
        await this.ui.sendInput(featureCode)
    }

    private static async executeAndWaitForPrompt() {
        const promise = this.execute()
        await this.ui.waitForInput()
        return { promise }
    }

    private static execute(options?: InstallFeatureActionOptions) {
        return this.action.execute(options ?? {})
    }
}
