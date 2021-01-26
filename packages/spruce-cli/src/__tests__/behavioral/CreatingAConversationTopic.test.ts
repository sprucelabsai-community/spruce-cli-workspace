import { test, assert } from '@sprucelabs/test'
import AbstractCliTest from '../../tests/AbstractCliTest'
import testUtil from '../../tests/utilities/test.utility'

export default class CreatingAConversationTopicTest extends AbstractCliTest {
	@test()
	protected static async hasCreateConversationAction() {
		const cli = await this.Cli()
		assert.isFunction(cli.getFeature('conversation').Action('create').execute)
	}

	@test()
	protected static async createsValidConversationTopicDefinition() {
		const cli = await this.FeatureFixture().installCachedFeatures(
			'conversation'
		)

		const results = await cli
			.getFeature('conversation')
			.Action('create')
			.execute({
				nameReadable: 'book an appointment',
				nameCamel: 'bookAnAppointment',
			})

		const match = testUtil.assertsFileByNameInGeneratedFiles(
			'bookAnAppointment.topic.ts',
			results.files
		)

		const imported = await this.Service('import').importDefault(match)

		assert.isTruthy(imported)
		assert.isEqual(imported.label, 'book an appointment')
		assert.isArray(imported.utterances)
		assert.isArray(imported.script)
	}
}
