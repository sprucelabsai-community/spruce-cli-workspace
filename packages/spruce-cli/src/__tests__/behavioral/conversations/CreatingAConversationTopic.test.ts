import '@sprucelabs/spruce-conversation-plugin'
import { test, assert } from '@sprucelabs/test-utils'
import AbstractCliTest from '../../../tests/AbstractCliTest'
import testUtil from '../../../tests/utilities/test.utility'
import { CliInterface } from '../../../types/cli.types'

export default class CreatingAConversationTopicTest extends AbstractCliTest {
    @test()
    protected static async hasCreateConversationAction() {
        assert.isFunction(this.Action('conversation', 'create').execute)
    }

    @test()
    protected static async createsValidConversationTopicDefinition() {
        const cli =
            await this.FeatureFixture().installCachedFeatures('conversation')

        const results = await this.Action('conversation', 'create').execute({
            nameReadable: 'book an appointment',
            nameCamel: 'bookAnAppointment',
        })

        const match = testUtil.assertFileByNameInGeneratedFiles(
            'bookAnAppointment.topic.ts',
            results.files
        )

        const imported = await this.Service('import').importDefault(match)

        assert.isTruthy(imported)
        assert.isEqual(imported.label, 'book an appointment')
        assert.isArray(imported.utterances)
        assert.isArray(imported.script)

        await this.assertHealthCheckResultsAreValid(cli)
    }

    private static async assertHealthCheckResultsAreValid(cli: CliInterface) {
        const health = await cli.checkHealth()
        //@ts-ignore
        assert.isTruthy(health.conversation)
        //@ts-ignore
        assert.isArray(health.conversation.topics)
        //@ts-ignore
        assert.isLength(health.conversation.topics, 1)
        //@ts-ignore
        assert.doesInclude(health.conversation.topics, 'bookAnAppointment')
    }
}
