import { diskUtil } from '@sprucelabs/spruce-skill-utils'
import { test, assert } from '@sprucelabs/test'
import { errorAssertUtil } from '@sprucelabs/test-utils'
import FeatureCommandAttacher from '../../features/FeatureCommandAttacher'
import AbstractCliTest from '../../tests/AbstractCliTest'
import MockProgramFactory, { MockProgram } from '../../tests/MockProgramFactory'

export default class FeatureCommandAttacherTest extends AbstractCliTest {
	private static attacher: FeatureCommandAttacher
	private static program: MockProgram

	protected static async beforeEach() {
		await super.beforeEach()

		this.program = this.MockCommanderProgram()

		this.attacher = new FeatureCommandAttacher({
			program: this.program,
			ui: this.ui,
			optionOverrides: {
				'sync.schemas': {
					fetchCoreSchemas: false,
				},
			},
			blockedCommands: {},
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
			option: '--fetchRemoteSchemas [true|false]',
		})

		assert.doesInclude(this.program.optionInvocations, {
			command: 'sync.schemas',
			option: '--generateCoreSchemaTypes [true|false]',
		})
	}

	@test.skip('enable when private fields can be optionally shown in help.')
	protected static async ignoresPrivateFields() {
		await this.attachSchemaFeature()

		assert.doesNotInclude(this.program.optionInvocations, {
			command: 'create.schema',
			option: '--enableVersioning [true|false]',
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
		const feature = cli.getFeature('skill')

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

	@test.skip(
		'overridding overrides is not possible without reworking attacher and this will break other tests'
	)
	protected static async overriddenCanBeIgnoredByPassingArg() {
		await this.FeatureFixture().installCachedFeatures('schemas')
		await this.attachSchemaFeature()
		await this.program.actionHandler({ fetchCoreSchemas: 'true' })

		const personPath = this.resolveHashSprucePath(
			'schemas',
			'spruce',
			'v2020_07_22',
			'person.schema.ts'
		)

		assert.isTrue(diskUtil.doesFileExist(personPath))
	}

	@test()
	protected static async blockedCommandsThrow() {
		this.attacher = new FeatureCommandAttacher({
			program: this.program,
			ui: this.ui,
			optionOverrides: {},
			blockedCommands: {
				'sync.schemas': 'this is blocked',
			},
		})

		await this.attachSchemaFeature()
		const err = await assert.doesThrowAsync(() =>
			this.program.actionHandler({})
		)

		errorAssertUtil.assertError(err, 'COMMAND_BLOCKED')
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
