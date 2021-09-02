import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import FeatureCommandAttacher from '../../features/FeatureCommandAttacher'
import AbstractCliTest from '../../tests/AbstractCliTest'
import MockProgramFactory, { MockProgram } from '../../tests/MockProgramFactory'

export default class FeatureCommandAttacherTest extends AbstractCliTest {
	private static attacher: FeatureCommandAttacher
	private static program: MockProgram

	protected static async beforeEach() {
		await super.beforeEach()

		this.program = this.MockCommanderProgram()

		const actionExecuter = this.ActionExecuter()

		this.attacher = new FeatureCommandAttacher({
			program: this.program,
			ui: this.ui,
			actionExecuter,
		})
	}

	@test()
	protected static canInstantiateAttacher() {
		assert.isTruthy(this.attacher)
	}

	@test()
	protected static hasAttachMethod() {
		assert.isFunction(this.attacher.attachFeature)
	}

	@test()
	protected static async attachFeatureSetsUpCommands() {
		await this.attachSchemaFeature()

		assert.doesInclude(this.program.commandInvocations, 'create.schema')
		assert.doesInclude(this.program.commandInvocations, 'sync.schemas')
		assert.doesInclude(this.program.commandInvocations, 'sync.fields')

		assert.doesInclude(this.program.descriptionInvocations, {
			command: 'create.schema',
		})
		assert.doesInclude(this.program.descriptionInvocations, {
			command: 'sync.schemas',
		})
		assert.doesInclude(this.program.descriptionInvocations, {
			command: 'sync.fields',
		})

		assert.doesInclude(this.program.actionInvocations, 'create.schema')
		assert.doesInclude(this.program.actionInvocations, 'sync.schemas')
		assert.doesInclude(this.program.actionInvocations, 'sync.fields')
	}

	@test()
	protected static async setsUpOptions() {
		await this.attachSchemaFeature()

		assert.doesInclude(this.program.optionInvocations, {
			command: 'create.schema',
			option: '--schemaBuilderDestinationDir <schemaBuilderDestinationDir>',
			defaultValue: 'src/schemas',
		})

		assert.doesInclude(this.program.optionInvocations, {
			command: 'create.schema',
			option: '--description <description>',
		})

		assert.doesInclude(this.program.optionInvocations, {
			command: 'sync.fields',
			option: '--addonsLookupDir <addonsLookupDir>',
		})

		assert.doesInclude(this.program.optionInvocations, {
			command: 'sync.schemas',
			option: '--shouldFetchRemoteSchemas [true|false]',
		})

		assert.doesInclude(this.program.optionInvocations, {
			command: 'sync.schemas',
			option: '--shouldGenerateCoreSchemaTypes [true|false]',
		})
	}

	@test.skip('enable when private fields can be optionally shown in help.')
	protected static async ignoresPrivateFields() {
		await this.attachSchemaFeature()

		assert.doesNotInclude(this.program.optionInvocations, {
			command: 'create.schema',
			option: '--shouldEnableVersioning [true|false]',
		})
	}

	@test()
	protected static async testBooleanArg() {
		const cli = await this.Cli()
		const vscodeFeature = cli.getFeature('vscode')

		await this.attacher.attachFeature(vscodeFeature)

		assert.doesInclude(this.program.optionInvocations, {
			command: 'setup.vscode',
			option: '--all [true|false]',
		})
	}

	@test()
	protected static async handlesAliases() {
		const cli = await this.Cli()
		const feature = cli.getFeature('node')

		await this.attacher.attachFeature(feature)

		assert.doesInclude(this.program.aliasesInvocations, 'update')
	}

	@test()
	protected static async testActionWithSameNameAsFeature() {
		const cli = await this.Cli()
		const vscodeFeature = cli.getFeature('test')

		await this.attacher.attachFeature(vscodeFeature)

		const match = this.program.commandInvocations.find((i) => i === 'test')
		assert.isTruthy(match)
	}

	@test()
	protected static async optionsCanBeOverridden() {
		await this.FeatureFixture().installCachedFeatures('schemas')
		await this.attachSchemaFeature()

		await this.program.actionHandler({})

		const personPath = this.resolveHashSprucePath(
			'schemas',
			'spruce',
			'v2020_07_22',
			'person.schema.ts'
		)

		assert.isFalse(diskUtil.doesFileExist(personPath))
	}

	private static async attachSchemaFeature() {
		const cli = await this.Cli()
		const schemaFeature = cli.getFeature('schema')

		await this.attacher.attachFeature(schemaFeature)
	}

	private static MockCommanderProgram(): MockProgram {
		return MockProgramFactory.Program()
	}
}
