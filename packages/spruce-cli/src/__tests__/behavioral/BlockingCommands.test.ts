import { test, assert } from '@sprucelabs/test-utils'
import { errorAssert } from '@sprucelabs/test-utils'
import AbstractSkillTest from '../../tests/AbstractSkillTest'
import MockProgramFactory from '../../tests/MockProgramFactory'

export default class OverridingCommandsInPackageJsonTest extends AbstractSkillTest {
	protected static skillCacheKey = 'schemas'

	@test()
	protected static async blockedCommandsThrow() {
		const pkg = this.Service('pkg')
		pkg.set({
			path: ['skill', 'blockedCommands'],
			value: { 'sync.schemas': `Stop now!` },
		})

		const cli = await this.FeatureFixture().Cli({
			program: MockProgramFactory.Program(),
		})

		//@ts-ignore
		const executer = cli.getActionExecuter()
		const results = await executer.Action('schema', 'sync').execute()

		assert.isTruthy(results.errors)
		errorAssert.assertError(results.errors[0], 'COMMAND_BLOCKED')
	}

	@test()
	protected static async blocksWhenCommandIsForwardedFromAnother() {
		const pkg = this.Service('pkg')
		pkg.set({
			path: ['skill', 'blockedCommands'],
			value: { 'sync.schemas': `Stop now!` },
		})

		const cli = await this.FeatureFixture().Cli({
			program: MockProgramFactory.Program(),
			cwd: this.cwd,
			graphicsInterface: this.ui,
		})

		//@ts-ignore
		const executer = cli.getActionExecuter()
		const results = await executer.Action('schema', 'create').execute({
			nameReadable: 'Test schema!',
			namePascal: 'Test',
			nameCamel: 'test',
			description: 'this is so great!',
		})

		assert.isTruthy(results.errors)
		errorAssert.assertError(results.errors[0], 'COMMAND_BLOCKED')
	}
}
