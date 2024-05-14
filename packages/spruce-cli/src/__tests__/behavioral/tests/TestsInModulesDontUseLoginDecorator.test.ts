import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { assert, test } from '@sprucelabs/test-utils'
import ActionQuestionAskerImpl, {
    ActionQuestionAsker,
    QuestionAskerOptionsOptions,
} from '../../../features/ActionQuestionAsker'
import { FeatureInstallResponse } from '../../../features/features.types'
import AbstractCliTest from '../../../tests/AbstractCliTest'

const ABSTRACT_SPRUCE_TEST_IDX = '-1'

export default class TestsInModulesDontUseLoginDecoratorTest extends AbstractCliTest {
    protected static async beforeEach() {
        await super.beforeEach()
        ActionQuestionAskerImpl.Class = StubQuestionAsker
    }

    @test()
    protected static async creatingATestInModuleDoesNotComeWithDecorator() {
        await this.installSkill('testsInNodeModule')
        const contents = await this.createTestValidateAndGetContents()
        assert.doesNotInclude(contents, 'spruce-test-fixtures')
    }

    @test()
    protected static async creatingATestInSkillComesWithLoginDecorator() {
        await this.installSkill('tests')
        const contents = await this.createTestValidateAndGetContents()
        assert.doesInclude(contents, 'spruce-test-fixtures')
        assert.doesInclude(contents, /^@fake\.login\(\)/m)
    }

    private static async createTestValidateAndGetContents() {
        const promise = this.Action('test', 'create').execute({
            type: 'behavioral',
            nameReadable: 'test',
            nameCamel: 'test',
        })

        await this.ui.waitForInput()
        await this.ui.sendInput(ABSTRACT_SPRUCE_TEST_IDX)

        const results = await promise

        await this.assertValidActionResponseFiles(results)

        const testFile = results.files![0].path
        const contents = diskUtil.readFile(testFile)
        return contents
    }

    private static async installSkill(key: string) {
        await this.FeatureFixture().installCachedFeatures(key)
    }
}

class StubQuestionAsker implements ActionQuestionAsker<'test'> {
    public async installOrMarkAsSkippedMissingDependencies(): Promise<FeatureInstallResponse> {
        return {}
    }

    public async askAboutMissingFeatureOptionsIfFeatureIsNotInstalled(
        _isInstalled: boolean,
        options?: QuestionAskerOptionsOptions<'test'>
    ) {
        return options ?? {}
    }

    public async askAboutMissingActionOptions() {
        return undefined
    }

    public async installOurFeature(): Promise<FeatureInstallResponse> {
        return {}
    }
}
