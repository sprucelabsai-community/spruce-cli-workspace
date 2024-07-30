import { diskUtil, namesUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'

export default class SettingUpPolishTest extends AbstractCliTest {
    @test()
    protected static async hasCreateAction() {
        assert.isFunction(this.Action('polish', 'setup').execute)
    }

    @test()
    protected static async setsUpExpectedScript() {
        await this.installSkillAndSetupPolish()
        await this.assertPolishScriptWrittenToExpectedPlace()
    }

    @test()
    protected static async polishResultsAreExpected() {
        const results = await this.installSkillAndSetupPolish()
        const { filename, destination } = await this.generateExpectedFile()

        assert.isLength(results.files, 1)
        assert.isEqualDeep(results, {
            files: [
                {
                    name: filename,
                    description: `Polish script at ${filename}!`,
                    path: destination,
                    action: 'generated',
                },
            ],
        })
    }

    @test()
    protected static async createsExpectedScript() {
        await this.installSkillAndSetupPolish()
        const pkg = this.Service('pkg')
        const scripts = pkg.get('scripts')
        assert.isEqual(scripts.polish, 'heartwood-polish')
    }

    @test()
    protected static async makeSureScriptHasSomethingAndIsValid() {
        const results = await this.installSkillAndSetupPolish()
        const { destination } = await this.generateExpectedFile()
        const contents = diskUtil.readFile(destination)
        assert.isNotEqual(contents, '')
        await this.assertValidActionResponseFiles(results)
    }

    @test()
    protected static async polishCreatesExpectedFileNameBasedOnSkillsNamespace() {
        await this.installSkill()
        const pkg = await this.Service('pkg')
        const namespace = 'my-skill'
        pkg.set({
            path: ['skill', 'namespace'],
            value: namespace,
        })

        await this.assertPolishScriptWrittenToExpectedPlace()
    }

    private static async assertPolishScriptWrittenToExpectedPlace() {
        const { destination } = await this.generateExpectedFile()

        assert.isTrue(
            diskUtil.doesFileExist(destination),
            `Did not find polish script at ${destination}!`
        )
    }

    private static async generateExpectedFile() {
        const store = this.Store('skill')

        const namespace = await store.loadCurrentSkillsNamespace()
        const filename = `${namesUtil.toKebab(namespace)}.polish.ts`
        const destination = this.resolvePath('src', filename)
        return { filename, destination }
    }

    private static async installSkillAndSetupPolish() {
        await this.installSkill()
        const results = await this.setupPolish()
        return results
    }

    private static async setupPolish() {
        return await this.Action('polish', 'setup').execute({})
    }

    private static async installSkill() {
        await this.FeatureFixture().installCachedFeatures('polish')
    }
}
